"use client"
import React, { useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../src/components/ui/accordion';
import { Folder, Record } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import Markdown from 'react-markdown';
import styles from './record-item.module.css'
import remarkGfm from 'remark-gfm'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../../src/components/ui/command';
import { RecordContext } from '@/contexts/record-context';
import { prompts } from '@/data/ai/prompts';
import { ClipboardPasteIcon, CommandIcon, LanguagesIcon, MoveRight, ShellIcon, TerminalIcon, TextQuoteIcon, Wand2Icon } from 'lucide-react';
import { ChatContext, MessageVisibility } from '@/contexts/chat-context';
import { promptTemplates  } from '@/data/ai/prompt-templates';
import { Pencil2Icon, QuestionMarkCircledIcon, QuestionMarkIcon } from '@radix-ui/react-icons';
import { ConfigContext } from '@/contexts/config-context';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { removeCodeBlocks } from '@/lib/utils';

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
}


const ChatCommands: React.FC<Props> = ({ open, setOpen }) => {
    const recordContext = useContext(RecordContext);
    const chatContext = useContext(ChatContext)
    const config = useContext(ConfigContext);
    return (<CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput className="text-sm" placeholder="Type a command or search..." />
        <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
                <CommandItem key="cmd-custom" className="text-xs" onSelect={(v) => {
                    chatContext.setAgentContext(null);
                    chatContext.setTemplatePromptVisible(false);
                    chatContext.setChatCustomPromptVisible(true);
                    setOpen(false);
                    chatContext.setChatOpen(true);
                  }}><TerminalIcon /> Enter your own question</CommandItem>
                {Object.entries(promptTemplates).map(promptTpl => (
                    <CommandItem key={promptTpl[0]} className="text-xs" onSelect={(v) => {
                        chatContext.setAgentContext(null);
                        chatContext.setPromptTemplate(promptTpl[1].template({ config }));
                        chatContext.setChatCustomPromptVisible(false);
                        chatContext.setTemplatePromptVisible(true);
                        setOpen(false);
                        chatContext.setChatOpen(true);
                    }}><QuestionMarkIcon /> {promptTpl[1].label}</CommandItem>        
                 ))       
                }
                <CommandItem key="cmd-commands" className="text-xs" onSelect={(v) => {
                        chatContext.startAgent({
                            displayName: 'Pre visit inquiry',
                            type: 'pre-visit-inquiry',
                            crossCheckEnabled: false,
                            agentFinishDialog: true,
                            agentFinishMessage: 'Check the Results in Downloads folder on your device. If you click YES the messages will be cleared and the context will be reset so you can start a new thread. Otherwise you will stay in the agent context. You can always use New Chat button to clear the context.',
                            onAgentFinished(messageAction, lastMessage) {
                                // last message is patient summary
                                const filename = `pre-visit-inquiry-${new Date().toDateString()}.html`;
                                lastMessage.content = removeCodeBlocks(lastMessage.content);
                                chatContext.downloadMessage(lastMessage, filename, 'html');

                                toast('Pre-visit inquiry completed. Message saved as HTML file you can pass to your doctor!');
                                //setTimeout(() => chatContext.newChat(), 1000);
                                
                            },
                            
                        }, prompts.preVisitQuery({ config }), []);
                        setOpen(false);
                }}><Pencil2Icon className="w-4 h-4 mr-2" />Pre-visit inquiry</CommandItem>

            </CommandGroup>
            {/* <CommandSeparator />
            <CommandGroup heading="Translations">
            </CommandGroup> */}
        </CommandList>
    </CommandDialog>)
};

export default ChatCommands;

