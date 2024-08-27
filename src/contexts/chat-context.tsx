import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { CreateMessage, Message, Attachment } from 'ai/react';
import { nanoid } from 'nanoid';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { ollama, createOllama } from 'ollama-ai-provider';
import { CallWarning, convertToCoreMessages, FinishReason, streamText } from 'ai';
import { ConfigContext } from './config-context';
import { toast } from 'sonner';
import { Record } from '@/data/client/models';
import { StatDTO } from '@/data/dto';
import { AggregateStatResponse, StatApiClient } from '@/data/client/stat-api-client';
import { DatabaseContext } from './db-context';

export enum MessageDisplayMode {
    Text = 'text',
    InternalJSONRequest = 'internalJSONRequest',
    InternalJSONResponse= 'internalJSONResponse'
}

export enum MessageVisibility {
    Hidden = 'hidden',
    Visible = 'visible',
    VisibleWhenFinished = 'visibleWhenFinished',
    ProgressWhileStreaming = 'progressWhileStreaming'
}

export enum MessageType {
    Chat = 'chat',
    Parse = 'parse'
}

export type MessageEx = Message & {
    prev_sent_attachments?: Attachment[];
    displayMode?: MessageDisplayMode
    finished: boolean

    type: MessageType,
    visibility?: MessageVisibility

    recordRef: Record
    recordSaved: boolean
}

export type CreateMessageEx = MessageEx & {
    id?: MessageEx['id'];
}

export type AIResultEventType = {
    finishReason: FinishReason;
    usage: any;
    text: string;
    toolCalls?: {
        type: "tool-call";
        toolCallId: string;
        toolName: string;
        args: any;
    }[] | undefined;
    toolResults?: never[] | undefined;
    rawResponse?: {
        headers?: Record<string, string>;
    };
    warnings?: CallWarning[];
}
type OnResultCallback = (result: MessageEx, eventData: AIResultEventType) => void;

export type CreateMessageEnvelope = {
    message: CreateMessageEx;
    providerName?: string;
    onResult?: OnResultCallback
}
export type CreateMessagesEnvelope = {
    messages: CreateMessageEx[];
    providerName?: string;
    onResult?: OnResultCallback
}

export type ChatContextType = {
    messages: MessageEx[];
    visibleMessages: MessageEx[];
    lastMessage: MessageEx | null;
    providerName?: string;
    areRecordsLoaded: boolean;
    setRecordsLoaded: (value: boolean) => void;
    sendMessage: (msg: CreateMessageEnvelope) => void;
    sendMessages: (msg: CreateMessagesEnvelope) => void;
    chatOpen: boolean,
    setChatOpen: (value: boolean) => void;
    chatCustomPromptVisible: boolean;
    setChatCustomPromptVisible: (value: boolean) => void;
    chatTemplatePromptVisible: boolean;
    setTemplatePromptVisible: (value: boolean) => void;
    isStreaming: boolean;
    checkApiConfig: () => Promise<boolean>;
    aggregateStats: (newItem: StatDTO) => Promise<StatDTO>;
    promptTemplate: string;
    setPromptTemplate: (value: string) => void;
};

// Create the chat context
export const ChatContext = createContext<ChatContextType>({
    messages: [],
    visibleMessages: [],
    lastMessage: null,
    providerName: '',
    areRecordsLoaded: false,
    setRecordsLoaded: (value: boolean) => {},
    sendMessage: (msg: CreateMessageEnvelope) => {},
    sendMessages: (msg: CreateMessagesEnvelope) => {},
    chatOpen: false,
    setChatOpen: (value: boolean) => {},
    isStreaming: false,
    checkApiConfig: async () => { return false },
    aggregateStats: async (newItem) => { return Promise.resolve(newItem); },
    chatCustomPromptVisible: false,
    setChatCustomPromptVisible: (value: boolean) => {},
    chatTemplatePromptVisible: false,
    setTemplatePromptVisible: (value: boolean) => {},
    promptTemplate: '',
    setPromptTemplate: (value: string) => {}

});

// Custom hook to access the chat context
export const useChatContext = () => useContext(ChatContext);

// Chat context provider component
export const ChatContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    
    const [ messages, setMessages ] = useState([
        { role: 'user', name: 'You', content: 'Hi there! I will send in this conversation some medical records, please help me understand it and answer the questions as if you were physican!', visibility: MessageVisibility.Visible } as MessageEx,
//        { role: 'assistant', name: 'AI', content: 'Sure! I will do my best to answer all your questions specifically to your records' }
    ] as MessageEx[]);
    const [visibleMessages, setVisibleMessages] = useState<MessageEx[]>(messages);
    const [lastMessage, setLastMessage] = useState<MessageEx | null>(null);
    const [providerName, setProviderName] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [areRecordsLoaded, setRecordsLoaded] = useState(false);
    const [chatCustomPromptVisible, setChatCustomPromptVisible] = useState(false);
    const [chatTemplatePromptVisible, setTemplatePromptVisible] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState('');


    const dbContext = useContext(DatabaseContext);
    const config = useContext(ConfigContext);
    const checkApiConfig = async (): Promise<boolean> => {
        const apiKey = await config?.getServerConfig('chatGptApiKey') as string;
        if (!apiKey) {
            config?.setConfigDialogOpen(true);
            toast.info('Please enter Chat GPT API Key first');
            return false;
        } else return true;
    }

    const filterVisibleMessages = (messages: MessageEx[]): MessageEx[] => {
        return [...messages.filter(msg => { // display only visible messages
            return (msg.visibility !== MessageVisibility.Hidden && 
                  (msg.visibility === MessageVisibility.Visible || msg.visibility === MessageVisibility.ProgressWhileStreaming) || (msg.visibility === MessageVisibility.VisibleWhenFinished && msg.finished == true))
        })];
    }

    const aiProvider = async (providerName:string = '') => {
        await checkApiConfig();

        if (!providerName) {
            providerName = await config?.getServerConfig('llmProviderChat') as string;
        }

        setProviderName(providerName);

        if (providerName === 'ollama') {
            let ollamaBaseUrl = await config?.getServerConfig('ollamaUrl') as string;
            let ollamaCredentials:string[] = []
            const urlSchema = ollamaBaseUrl.indexOf('https://') > -1 ? 'https://' : 'http://';
            ollamaBaseUrl = ollamaBaseUrl.replace(urlSchema, '');

            if (ollamaBaseUrl.indexOf('@') > -1) {
                const urlArray = ollamaBaseUrl.split('@')
                ollamaBaseUrl = urlArray[1];
                ollamaCredentials = urlArray[0].split(':');
            }
            const aiProvider = createOllama({
                baseURL: urlSchema + ollamaBaseUrl,
                headers: ollamaCredentials.length > 0 ? {
                    Authorization: `Basic ${btoa(ollamaCredentials[0] + ':' + ollamaCredentials[1])}`
                }: {}
            });
            return aiProvider.chat(await config?.getServerConfig('ollamaModel') as string);
        } else if (providerName === 'chatgpt'){
            const aiProvider = createOpenAI({
                compatibility: 'strict',
                apiKey: await config?.getServerConfig('chatGptApiKey') as string
            })
            return aiProvider.chat('chatgpt-4o-latest')   //gpt-4o-2024-05-13
        } else {
            toast.error('Unknown AI provider ' + providerName);
            throw new Error('Unknown AI provider ' + providerName);
        }
    }

    const aiApiCall = async (messages: MessageEx[], onResult?: OnResultCallback, providerName?: string) => {
        
        setIsStreaming(true);
        const resultMessage:MessageEx = {
            id: nanoid(),
            content: '',
            createdAt: new Date(),
            role: 'assistant',
            visibility: MessageVisibility.Visible
        }
        try {
            if (messages.length > 0) {
                if (!messages[messages.length - 1].type)
                    messages[messages.length - 1].type = MessageType.Chat; 
                if (messages[messages.length - 1].displayMode === MessageDisplayMode.InternalJSONRequest) {
                    resultMessage.visibility = !resultMessage.finished ? MessageVisibility.ProgressWhileStreaming : MessageVisibility.Visible; // hide the response until the request is finished
                }

                if (messages[messages.length - 1].type == MessageType.Parse) {
                    messages = [messages[messages.length - 1]] // send only the parse message - context is not required - #111
                }
            }
            const result = await streamText({
                model: await aiProvider(providerName),
                messages: convertToCoreMessages(messages),
                //maxTokens: 4096,
                onFinish: async (e) =>  {
                    try {
                        await aggregateStats({
                            eventName: messages[messages.length - 1].type ?? MessageType.Chat,
                            completionTokens: e.usage.completionTokens,
                            promptTokens: e.usage.promptTokens,
                            createdAt: new Date().toISOString(),
                        });
                    } catch (e) {
                        toast.error(e);
                    }
                    e.text.indexOf('```json') > -1 ? resultMessage.displayMode = MessageDisplayMode.InternalJSONResponse : resultMessage.displayMode = MessageDisplayMode.Text
                    resultMessage.finished = true;
                    if (onResult) onResult(resultMessage, e);
                }
            });
            

            for await (const delta of result.textStream) {
                resultMessage.content += delta;
                setMessages([...messages, resultMessage])
                setVisibleMessages(filterVisibleMessages([...messages, resultMessage]));
            }
            setIsStreaming(false);
            setMessages([...messages, resultMessage])
            setVisibleMessages(filterVisibleMessages([...messages, resultMessage]));
        } catch (e) {
            const errMsg = 'Error while streaming AI response: ' + e;
            if (onResult) onResult(resultMessage, { finishReason: 'error', text: errMsg, usage: null });
            setIsStreaming(false);
            toast.error(errMsg);
        }
    }

    const prepareMessage = (msg: MessageEx, setMessages: React.Dispatch<React.SetStateAction<MessageEx[]>>, messages: MessageEx[], setLastMessage: React.Dispatch<React.SetStateAction<MessageEx | null>>) => {
        const newlyCreatedOne = { ...msg, id: nanoid(), visibility: msg.visibility ? msg.visibility : MessageVisibility.Visible } as MessageEx;
        if (newlyCreatedOne.content.indexOf('json') > -1) {
            newlyCreatedOne.displayMode = MessageDisplayMode.InternalJSONRequest;
        } else {
            newlyCreatedOne.displayMode = MessageDisplayMode.Text;
        }
        setMessages([...messages, newlyCreatedOne]);
        setVisibleMessages(filterVisibleMessages([...messages, newlyCreatedOne]));
        setLastMessage(newlyCreatedOne);
        return newlyCreatedOne;
    }    
    const sendMessage = (envelope: CreateMessageEnvelope) => {
        const newlyCreatedOne = prepareMessage(envelope.message, setMessages, messages, setLastMessage);

        // removing attachments from previously sent messages
        // TODO: remove the workaround with "prev_sent_attachments" by extending the MessageEx type with our own to save space for it
        aiApiCall([...messages.map(msg => {
            return Object.assign(msg, { experimental_attachments: null, prev_sent_attachments: msg.experimental_attachments })
        }), newlyCreatedOne], envelope.onResult, envelope.providerName);
    }

    const sendMessages = (envelope: CreateMessagesEnvelope) => {
        const newMessages = [];
        for (const msg of envelope.messages) {
            const newlyCreatedOne = prepareMessage(msg, setMessages, messages, setLastMessage);
            newMessages.push(newlyCreatedOne);
        }

        // TODO: Add multi LLM support - messages hould be sent to different LLMs based on the message llm model - so the messages should be grouped in threads

        // removing attachments from previously sent messages
        aiApiCall([...messages.map(msg => {
            return Object.assign(msg, { experimental_attachments: null, prev_sent_attachments: msg.experimental_attachments })
        }), ...newMessages], envelope.onResult, envelope.providerName);        
    }

    const aggregateStats = async (newItem: StatDTO): Promise<StatDTO> => {
        const apiClient = new StatApiClient('', dbContext, { useEncryption: false });
        const aggregatedStats = await apiClient.aggregate(newItem) as AggregateStatResponse;
        if (aggregatedStats.status === 200) {
            console.log('Stats aggregated', aggregatedStats);
            return aggregatedStats.data;
        } else {
            throw new Error(aggregatedStats.message)
        }
    }

    const value = { 
        messages,
        visibleMessages,
        lastMessage,
        providerName,
        sendMessage,
        sendMessages,
        chatOpen,
        setChatOpen,
        isStreaming,
        areRecordsLoaded,
        setRecordsLoaded,
        checkApiConfig,
        aggregateStats,
        chatCustomPromptVisible,
        setChatCustomPromptVisible,
        chatTemplatePromptVisible,
        setTemplatePromptVisible,
        promptTemplate,
        setPromptTemplate
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

