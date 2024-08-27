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
import { ChatContext } from '@/contexts/chat-context';
import { promptTemplates  } from '@/data/ai/prompt-templates';
import { QuestionMarkCircledIcon, QuestionMarkIcon } from '@radix-ui/react-icons';
import { ConfigContext } from '@/contexts/config-context';

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
                    chatContext.setTemplatePromptVisible(false);
                    chatContext.setChatCustomPromptVisible(true);
                    setOpen(false);
                  }}><TerminalIcon /> Enter your own question</CommandItem>
                {Object.entries(promptTemplates).map(promptTpl => (
                    <CommandItem key={promptTpl[0]} className="text-xs" onSelect={(v) => {
                        chatContext.setPromptTemplate(promptTpl[1].template({ config }));
                        chatContext.setChatCustomPromptVisible(false);
                        chatContext.setTemplatePromptVisible(true);
                    }}><QuestionMarkIcon /> {promptTpl[1].label}</CommandItem>        
                 ))       
                }

            </CommandGroup>
            {/* <CommandSeparator />
            <CommandGroup heading="Translations">
            </CommandGroup> */}
        </CommandList>
    </CommandDialog>)
};

export default ChatCommands;

