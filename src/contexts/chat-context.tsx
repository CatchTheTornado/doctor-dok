import React, { createContext, useContext, useState } from 'react';
import { CreateMessage, Message } from 'ai/react';
import { nanoid } from 'nanoid';

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
        { role: 'user', name: 'You', content: 'Hi there! I\'d like to talk with you about my health based on all health records and attachments I posted so far' },
        { role: 'bot', name: 'AI', content: 'Sure! I will do my best to answer all your questions specifically to your records' }
    ] as Message[]);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    const value = { 
        messages,
        lastMessage,
        sendMessage: (msg: CreateMessage) => { // TODO: Add Vercel AI SDK call
            const newlyCreatedOne = { ...msg, id: nanoid() };
            setMessages([...messages, newlyCreatedOne]);
            setLastMessage(newlyCreatedOne)
        }
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};