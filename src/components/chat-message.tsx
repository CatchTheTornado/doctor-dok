import React from 'react';
import Markdown from 'react-markdown'
import ZoomableImage from './zoomable-image';
import { MessageEx } from '@/contexts/chat-context';

interface ChatMessageProps {
    message: MessageEx;
    ref?: React.Ref<HTMLDivElement>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, ref }) => {
    return (
    <div id={'msg-' + message.id} ref={ref} className={message.role === 'user' ?  "flex items-start gap-4 justify-end" :  "flex items-start gap-4"}>
        <div className={message.role === 'user' ?  "p-4 grid gap-4 text-right rounded-lg max-w-[70%] bg-gray dark:bg-zinc-500" :  "p-4 grid gap-1 rounded-lg max-w-[70%] bg-white dark:bg-zinc-950"}>
          <div className="font-bold">{message.name}</div>
          <div className="prose text-sm text-muted-foreground [&>*]:p-2 [&_li]:list-disc [&_li]:ml-4">
            {message.displayMode === 'internalJSONRequest' || message.displayMode === 'internalJSONResponse' ? ('JSON') : (null)}
            <Markdown>
              {message.content}
            </Markdown>
              <div className="flex items-center justify-left min-h-100">
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <ZoomableImage
                      className='w-100 p-2'
                      width={100}
                      height={100}
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ))}
               {message.prev_sent_attachments
                  ?.filter(attachment =>
                    attachment.contentType.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <ZoomableImage
                      className='w-100 p-2'
                      width={100}
                      height={100}
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ))}                  
              </div>            
          </div>
        </div>
      </div>
    );
};

export default ChatMessage;