import React from 'react';
import { Message } from 'ai/react';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { AvatarImage } from './ui/avatar';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    return (
    <div className={message.role === 'user' ?  "flex items-start gap-4 justify-end" :  "flex items-start gap-4"}>
        {message.role !== 'user' ? (
          <Avatar className="w-8 h-8 border rounded">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        ) : null }
        <div className={message.role === 'user' ?  "grid gap-1 text-right bg-gray dark:bg-zinc-200 rounded" :  "grid gap-1 rounded bg-white dark:bg-zinc-950"}>
          <div className="font-bold">{message.name}</div>
          <div className="prose text-muted-foreground">
            {message.content}
          </div>
        </div>
      </div>
    );
};

export default ChatMessage;