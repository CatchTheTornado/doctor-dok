import React from 'react';
import Markdown from 'react-markdown'
import ZoomableImage from './zoomable-image';
import { MessageEx } from '@/contexts/chat-context';
import remarkGfm from 'remark-gfm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import styles from './chat-message.module.css';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface ChatMessageProps {
    message: MessageEx;
    ref?: React.Ref<HTMLDivElement>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, ref }) => {
    const { theme, systemTheme } = useTheme();
    const shTheme = (theme === 'system' ? systemTheme : theme) === 'dark' ? 'material-dark' : 'material-light';
    return (
    <div id={'msg-' + message.id} ref={ref} className={message.role === 'user' ?  "flex items-start gap-4 justify-end" :  "flex items-start gap-4"}>
        <div className={message.role === 'user' ?  "p-4 gap-4 text-right rounded-lg max-w-[70%] bg-gray dark:bg-zinc-500" :  "p-4 gap-1 rounded-lg max-w-[70%] bg-white dark:bg-zinc-950"}>
          <div className="font-bold">{message.name}</div>
          <div className="prose text-sm text-muted-foreground">
            {message.displayMode === 'internalJSONRequest' ? (
              <div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Data object request</AccordionTrigger>
                        <AccordionContent>
                          <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}  components={{
                            code(props) {
                              const {children, className, node, ...rest} = props
                              const match = /language-(\w+)/.exec(className || '')
                              return match ? (
                                <SyntaxHighlighter
                                  {...rest}
                                  PreTag="div"
                                  wrapLines={true}
                                  wrapLongLines={true}
                                  children={String(children).replace(/\n$/, '')}
                                  language={match[1]}
                                  theme={shTheme}
                                />
                              ) : (
                                <code {...rest} className={className}>
                                  {children}
                                </code>
                              )
                }
              }}>{message.content}</Markdown>                          
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>                  
            ) : (message.displayMode === 'internalJSONResponse' ? (
              <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Data object response</AccordionTrigger>
                        <AccordionContent>
                          <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}  components={{
                            code(props) {
                              const {children, className, node, ...rest} = props
                              const match = /language-(\w+)/.exec(className || '')
                              return match ? (
                                <SyntaxHighlighter
                                  {...rest}
                                  PreTag="div"
                                  wrapLines={true}
                                  wrapLongLines={true}
                                  children={String(children).replace(/\n$/, '')}
                                  language={match[1]}
                                  wrapLines={true}
                                  theme={shTheme}
                                />
                              ) : (
                                <code {...rest} className={className}>
                                  {children}
                                </code>
                              )
                }
              }}>{message.content}</Markdown>                          
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>
                {message.content}
              </Markdown>
            ))}
              <div className="flex-wrap flex items-center justify-left min-h-100">
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