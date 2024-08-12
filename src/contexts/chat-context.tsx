import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { CreateMessage, Message, Attachment } from 'ai/react';
import { nanoid } from 'nanoid';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { ollama, createOllama } from 'ollama-ai-provider';
import { CallWarning, convertToCoreMessages, FinishReason, streamText } from 'ai';
import { ConfigContext } from './config-context';
import { toast } from 'sonner';

enum MessageDisplayMode {
    Text = 'text',
    InternalJSONRequest = 'internalJSONRequest',
    InternalJSONResponse= 'internalJSONResponse'
}


export type MessageEx = Message & {
    prev_sent_attachments?: Attachment[];
    displayMode?: MessageDisplayMode
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

type ChatContextType = {
    messages: MessageEx[];
    lastMessage: MessageEx | null;
    providerName?: string;
    sendMessage: (msg: CreateMessageEnvelope) => void;
    sendMessages: (msg: CreateMessagesEnvelope) => void;
    chatOpen: boolean,
    setChatOpen: (value: boolean) => void;
    isStreaming: boolean;
};

// Create the chat context
export const ChatContext = createContext<ChatContextType>({
    messages: [],
    lastMessage: null,
    providerName: '',
    sendMessage: (msg: CreateMessageEnvelope) => {},
    sendMessages: (msg: CreateMessagesEnvelope) => {},
    chatOpen: false,
    setChatOpen: (value: boolean) => {},
    isStreaming: false
});

// Custom hook to access the chat context
export const useChatContext = () => useContext(ChatContext);

// Chat context provider component
export const ChatContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    
    const [ messages, setMessages ] = useState([
        { role: 'user', name: 'You', content: 'Hi there! I will send in this conversation some medical records, please help me understand it and answer the questions as if you were physican!' },
//        { role: 'assistant', name: 'AI', content: 'Sure! I will do my best to answer all your questions specifically to your records' }
    ] as MessageEx[]);
    const [lastMessage, setLastMessage] = useState<MessageEx | null>(null);
    const [providerName, setProviderName] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    const config = useContext(ConfigContext);
    const checkApiConfig = async () => {
        const apiKey = await config?.getServerConfig('chatGptApiKey') as string;
        if (!apiKey) {
            config?.setConfigDialogOpen(true);
            toast.info('Please enter Chat GPT API Key first');
        }
    }

    const aiProvider = async (providerName:string = '') => {
        console.log('Chat AI Provider request for: ' + providerName)
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
                apiKey: await config?.getServerConfig('chatGptApiKey') as string
            })
            return aiProvider.chat('gpt-4o')   //gpt-4o-2024-05-13
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
            role: 'assistant'
        }        
        const result = await streamText({
            model: await aiProvider(providerName),
            messages: convertToCoreMessages(messages),
            onFinish: (e) =>  {
                e.text.indexOf('```json') > -1 ? resultMessage.displayMode = MessageDisplayMode.InternalJSONResponse : resultMessage.displayMode = MessageDisplayMode.Text
                if (onResult) onResult(resultMessage, e);
                // TODO: add chat persistency and maybe extract health records / other data for #43
            }
          });
          

        for await (const delta of result.textStream) {
            resultMessage.content += delta;
            setMessages([...messages, resultMessage])
        }
        setIsStreaming(false);
        setMessages([...messages, resultMessage])
    }

    const prepareMessage = (msg: MessageEx, setMessages: React.Dispatch<React.SetStateAction<MessageEx[]>>, messages: MessageEx[], setLastMessage: React.Dispatch<React.SetStateAction<MessageEx | null>>) => {
        const newlyCreatedOne = { ...msg, id: nanoid() };
        if (newlyCreatedOne.content.indexOf('json') > -1) {
            newlyCreatedOne.displayMode = MessageDisplayMode.InternalJSONRequest;
        } else {
            newlyCreatedOne.displayMode = MessageDisplayMode.Text;
        }
        setMessages([...messages, newlyCreatedOne]);
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

    const value = { 
        messages,
        lastMessage,
        providerName,
        sendMessage,
        sendMessages,
        chatOpen,
        setChatOpen,
        isStreaming
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

