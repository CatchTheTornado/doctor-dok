import React, { createContext, useContext, useState } from 'react';
import { CreateMessage, Message } from 'ai/react';
import { nanoid } from 'nanoid';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { ConfigContext } from './config-context';


type ChatContextType = {
    messages: Message[];
    lastMessage: Message | null;
    sendMessage: (msg: CreateMessage) => void;
    chatOpen: boolean,
    setChatOpen: (value: boolean) => void;
    isStreaming: boolean;
};

// Create the chat context
export const ChatContext = createContext<ChatContextType>({
    messages: [],
    lastMessage: null,
    sendMessage: (msg: CreateMessage) => {},
    chatOpen: false,
    setChatOpen: (value: boolean) => {},
    isStreaming: false
});

// Custom hook to access the chat context
export const useChatContext = () => useContext(ChatContext);

// Chat context provider component
export const ChatContextProvider: React.FC = ({ children }) => {
    
    const [ messages, setMessages ] = useState([
        { role: 'user', name: 'You', content: 'Hi there! I will send in this conversation some medical records, please help me understand it and answer the questions as if you were physican!' },
//        { role: 'assistant', name: 'AI', content: 'Sure! I will do my best to answer all your questions specifically to your records' }
    ] as Message[]);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    const config = useContext(ConfigContext);

    const aiProvider = async () => {
        const aiProvider = createOpenAI({
            apiKey: await config?.getLocalConfig('chatGptApiKey') as string
        })
        return aiProvider.chat('gpt-4o-2024-05-13')   
    }

    const aiApiCall = async (messages: Message[]) => {
        
        setIsStreaming(true);
        const result = await streamText({
            model: await aiProvider(),
            messages: convertToCoreMessages(messages),
            onFinish: (e) =>  {
                // TODO: add chat persistency and maybe extract health records / other data for #43
            }
          });
          
        const resultMessage:Message = {
            id: nanoid(),
            content: '',
            createdAt: new Date(),
            role: 'assistant'
        }
        for await (const delta of result.textStream) {
            resultMessage.content += delta;
            setMessages([...messages, resultMessage])
        }
        setIsStreaming(false);
    }

    const sendMessage = (msg: CreateMessage) => { // TODO: Add Vercel AI SDK call
        const newlyCreatedOne = { ...msg, id: nanoid() };
        setMessages([...messages, newlyCreatedOne]);
        setLastMessage(newlyCreatedOne)

        // removing attachments from previously sent messages
        aiApiCall([...messages.map(msg => {
            return Object.assign(msg, { experimental_attachments: null, prev_sent_attachments: msg.experimental_attachments })
        }), newlyCreatedOne]);
    }

    const value = { 
        messages,
        lastMessage,
        sendMessage,
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