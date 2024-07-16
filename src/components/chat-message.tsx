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
        <Avatar className="w-8 h-8 border">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>OA</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="font-bold">{message.name}</div>
          <div className="prose text-muted-foreground">
            {message.content}
          </div>
        </div>
      </div>
    );
};

export default ChatMessage;