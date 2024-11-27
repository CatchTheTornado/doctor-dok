import React, { useContext } from 'react';
import ZoomableImage from './zoomable-image';
import { MessageEx, MessageVisibility } from '@/contexts/chat-context';
import remarkGfm from 'remark-gfm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Markdown from 'react-markdown'
import styles from './chat-message.module.css';
import { useTheme } from 'next-themes';
import showdown from 'showdown'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Button } from '@/components/ui/button';
import { DownloadIcon, SaveIcon } from 'lucide-react';
import { RecordContext } from '@/contexts/record-context';
import { removeCodeBlocks } from '@/lib/utils';

interface ChatMessageProps {
    message: MessageEx;
    ref?: React.Ref<HTMLDivElement>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, ref }) => {
    const { theme, systemTheme } = useTheme();
    const recordContext = useContext(RecordContext);
    const shTheme = (theme === 'system' ? systemTheme : theme) === 'dark' ? 'material-dark' : 'material-light';
    return (
    <div id={'msg-' + message.id} ref={ref} className={message.role === 'user' ?  "flex items-start gap-4 justify-end" :  "flex items-start gap-4"}>
        <div className={message.role === 'user' ?  "p-4 gap-4 text-right rounded-lg max-w-[90%] bg-gray dark:bg-zinc-500" :  "p-4 gap-1 rounded-lg max-w-[90%] bg-white dark:bg-zinc-950"}>
          <div className="font-bold">{message.name}</div>
          <div className="prose text-sm text-muted-foreground">
            {(message.visibility === MessageVisibility.ProgressWhileStreaming  && !message.finished) ? (
              <div className="flex"><span className="text-xs">Parsing data in progress ({message.recordRef ? 'rec: ' + message.recordRef.id + ', ' : ''}queue length: {recordContext?.parseQueueLength ? recordContext?.parseQueueLength : 1})... <Button className="h-6" onClick={(e) => message.visibility = MessageVisibility.Visible }>Show progress</Button></span></div>
            ) : (
              (message.displayMode === 'internalJSONRequest') ? (
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
                                  language={match[1]}
                                  theme={shTheme}
                                >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
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
            ) : ((message.displayMode === 'internalJSONResponse' ? (
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
                                  language={match[1]}
                                  theme={shTheme}
                                >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
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
            ) : ((message.displayMode === 'jsonAgentResponse' ? (              
              <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>
                {((message.messageAction && message.messageAction.type === 'agentQuestion') ? (
                  removeCodeBlocks(message.content) + message.messageAction?.params.question
                ) : (removeCodeBlocks(message.content)))}
              </Markdown>) : (
              <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>
                {message.content}
              </Markdown>
            ))))))}
            {message.role !== 'user'  && message.finished && !message.recordSaved ? (
              <div className="flex-wrap flex items-center justify-left">
                <Button title="Save message as new record" variant="ghost" size="icon" onClick={() => {
                  recordContext?.updateRecordFromText(message.content, message.recordRef ?? null, true);
                }}><SaveIcon /></Button>
                <Button title="Save message as new record" variant="ghost" size="icon" onClick={() => {

                    const converter = new showdown.Converter({ tables: true, completeHTMLDocument: true, openLinksInNewWindow: true });
                    converter.setFlavor('github');
                    const htmlContent = converter.makeHtml(message.content);

                    const mdElement = document.createElement('a');
                    const file = new Blob([message.content], { type: 'text/markdown' });
                    mdElement.href = URL.createObjectURL(file);
                    mdElement.download = `report-${message.id}.md`;
                    document.body.appendChild(mdElement);
                    mdElement.click();
                    document.body.removeChild(mdElement);

                    const htmlElement = document.createElement('a');
                    const fileHtml = new Blob([htmlContent], { type: 'text/html' });
                    htmlElement.href = URL.createObjectURL(fileHtml);
                    htmlElement.download = `report-${message.id}.html`;
                    document.body.appendChild(htmlElement);
                    htmlElement.click();
                    document.body.removeChild(htmlElement);

                }}><DownloadIcon /></Button>

              </div>
              ): null }
              <div className="flex-wrap flex items-center justify-left min-h-100">
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType?.startsWith('image/'),
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