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
};

// Create the chat context
export const ChatContext = createContext<ChatContextType>({
    messages: [],
    lastMessage: null,
    sendMessage: (msg: CreateMessage) => {},
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
    const config = useContext(ConfigContext);

    const aiProvider = async () => {
        const aiProvider = createOpenAI({
            apiKey: await config?.getLocalConfig('chatGptApiKey') as string
        })
        return aiProvider.chat('gpt-4o-2024-05-13')   
    }

    const aiApiCall = async (messages: Message[]) => {
        
        const result = await streamText({
            model: await aiProvider(),
            messages: convertToCoreMessages(messages),
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
    }

    const sendMessage = (msg: CreateMessage) => { // TODO: Add Vercel AI SDK call
        const newlyCreatedOne = { ...msg, id: nanoid() };
        setMessages([...messages, newlyCreatedOne]);
        setLastMessage(newlyCreatedOne)

        aiApiCall([...messages, newlyCreatedOne]);
    }

    const value = { 
        messages,
        lastMessage,
        sendMessage
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};