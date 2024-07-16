import React from 'react';
import { Message } from 'ai/react';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { AvatarImage } from './ui/avatar';

interface ChatMessageProps {
    message: Message;
    ref?: React.Ref<HTMLDivElement>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, ref }) => {
    return (
    <div id={'msg-' + message.id} ref={ref} className={message.role === 'user' ?  "flex items-start gap-4 justify-end" :  "flex items-start gap-4"}>
        <div className={message.role === 'user' ?  "p-4 grid gap-4 text-right rounded-lg max-w-[70%] bg-gray dark:bg-zinc-500" :  "p-4 grid gap-1 rounded-lg max-w-[70%] bg-white dark:bg-zinc-950"}>
          <div className="font-bold">{message.name}</div>
          <div className="prose text-sm text-muted-foreground">
            {message.content}
          </div>
        </div>
      </div>
    );
};

export default ChatMessage;