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
import { ClipboardPasteIcon, LanguagesIcon, MoveRight, TextQuoteIcon, Wand2Icon } from 'lucide-react';
import { ChatContext } from '@/contexts/chat-context';

interface Props {
    record: Record;
    folder?: Folder | null;
    open: boolean;
    setOpen: (value: boolean) => void;
}

const supportedLanguages = [
    {"name": "Albanian", "code": "alb", "country": "Albania"},
    {"name": "Arabic", "code": "ara", "country": "Arab World"},
    {"name": "Armenian", "code": "arm", "country": "Armenia"},
    {"name": "Awadhi", "code": "awa", "country": "India"},
    {"name": "Azerbaijani", "code": "aze", "country": "Azerbaijan"},
    {"name": "Bashkir", "code": "bak", "country": "Russia"},
    {"name": "Basque", "code": "eus", "country": "Spain"},
    {"name": "Belarusian", "code": "bel", "country": "Belarus"},
    {"name": "Bengali", "code": "ben", "country": "Bangladesh"},
    {"name": "Bhojpuri", "code": "bho", "country": "India"},
    {"name": "Bosnian", "code": "bos", "country": "Bosnia and Herzegovina"},
    {"name": "Brazilian Portuguese", "code": "por_br", "country": "Brazil"},
    {"name": "Bulgarian", "code": "bul", "country": "Bulgaria"},
    {"name": "Cantonese (Yue)", "code": "yue", "country": "China"},
    {"name": "Catalan", "code": "cat", "country": "Spain"},
    {"name": "Chhattisgarhi", "code": "hne", "country": "India"},
    {"name": "Chinese", "code": "zho", "country": "China"},
    {"name": "Croatian", "code": "hrv", "country": "Croatia"},
    {"name": "Czech", "code": "ces", "country": "Czech Republic"},
    {"name": "Danish", "code": "dan", "country": "Denmark"},
    {"name": "Dogri", "code": "doi", "country": "India"},
    {"name": "Dutch", "code": "nld", "country": "Netherlands"},
    {"name": "English", "code": "eng", "country": "United Kingdom"},
    {"name": "Estonian", "code": "est", "country": "Estonia"},
    {"name": "Faroese", "code": "fao", "country": "Faroe Islands"},
    {"name": "Finnish", "code": "fin", "country": "Finland"},
    {"name": "French", "code": "fra", "country": "France"},
    {"name": "Galician", "code": "glg", "country": "Spain"},
    {"name": "Georgian", "code": "kat", "country": "Georgia"},
    {"name": "German", "code": "deu", "country": "Germany"},
    {"name": "Greek", "code": "ell", "country": "Greece"},
    {"name": "Gujarati", "code": "guj", "country": "India"},
    {"name": "Haryanvi", "code": "bgc", "country": "India"},
    {"name": "Hindi", "code": "hin", "country": "India"},
    {"name": "Hungarian", "code": "hun", "country": "Hungary"},
    {"name": "Indonesian", "code": "ind", "country": "Indonesia"},
    {"name": "Irish", "code": "gle", "country": "Ireland"},
    {"name": "Italian", "code": "ita", "country": "Italy"},
    {"name": "Japanese", "code": "jpn", "country": "Japan"},
    {"name": "Javanese", "code": "jav", "country": "Indonesia"},
    {"name": "Kannada", "code": "kan", "country": "India"},
    {"name": "Kashmiri", "code": "kas", "country": "India"},
    {"name": "Kazakh", "code": "kaz", "country": "Kazakhstan"},
    {"name": "Konkani", "code": "kok", "country": "India"},
    {"name": "Korean", "code": "kor", "country": "South Korea"},
    {"name": "Kyrgyz", "code": "kir", "country": "Kyrgyzstan"},
    {"name": "Latvian", "code": "lav", "country": "Latvia"},
    {"name": "Lithuanian", "code": "lit", "country": "Lithuania"},
    {"name": "Macedonian", "code": "mkd", "country": "North Macedonia"},
    {"name": "Maithili", "code": "mai", "country": "India"},
    {"name": "Malay", "code": "msa", "country": "Malaysia"},
    {"name": "Maltese", "code": "mlt", "country": "Malta"},
    {"name": "Mandarin", "code": "cmn", "country": "China"},
    {"name": "Mandarin Chinese", "code": "cmn", "country": "China"},
    {"name": "Marathi", "code": "mar", "country": "India"},
    {"name": "Marwari", "code": "mwr", "country": "India"},
    {"name": "Min Nan", "code": "nan", "country": "China"},
    {"name": "Moldovan", "code": "ron_md", "country": "Moldova"},
    {"name": "Mongolian", "code": "mon", "country": "Mongolia"},
    {"name": "Montenegrin", "code": "cnr", "country": "Montenegro"},
    {"name": "Nepali", "code": "nep", "country": "Nepal"},
    {"name": "Norwegian", "code": "nor", "country": "Norway"},
    {"name": "Oriya", "code": "ori", "country": "India"},
    {"name": "Pashto", "code": "pus", "country": "Afghanistan"},
    {"name": "Persian (Farsi)", "code": "fas", "country": "Iran"},
    {"name": "Polish", "code": "pol", "country": "Poland"},
    {"name": "Portuguese", "code": "por", "country": "Portugal"},
    {"name": "Punjabi", "code": "pan", "country": "India"},
    {"name": "Rajasthani", "code": "raj", "country": "India"},
    {"name": "Romanian", "code": "ron", "country": "Romania"},
    {"name": "Russian", "code": "rus", "country": "Russia"},
    {"name": "Sanskrit", "code": "san", "country": "India"},
    {"name": "Santali", "code": "sat", "country": "India"},
    {"name": "Serbian", "code": "srp", "country": "Serbia"},
    {"name": "Sindhi", "code": "snd", "country": "Pakistan"},
    {"name": "Sinhala", "code": "sin", "country": "Sri Lanka"},
    {"name": "Slovak", "code": "slk", "country": "Slovakia"},
    {"name": "Slovene", "code": "slv", "country": "Slovenia"},
    {"name": "Slovenian", "code": "slv", "country": "Slovenia"},
    {"name": "Ukrainian", "code": "ukr", "country": "Ukraine"},
    {"name": "Urdu", "code": "urd", "country": "Pakistan"},
    {"name": "Uzbek", "code": "uzb", "country": "Uzbekistan"},
    {"name": "Vietnamese", "code": "vie", "country": "Vietnam"},
    {"name": "Welsh", "code": "cym", "country": "Wales"},
    {"name": "Wu", "code": "wuu", "country": "China"}
];

const RecordItemCommands: React.FC<Props> = ({ record, folder, open, setOpen }) => {
    const recordContext = useContext(RecordContext);
    const chatContext = useContext(ChatContext)
    return (<CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput className="text-sm" placeholder="Type a command or search..." />
        <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
                <CommandItem key="cmd-interpret" className="text-xs" onSelect={(v) => { recordContext?.extraToRecord('interpretation', prompts.recordInterpretation({ record }), record) }}><Wand2Icon /> AI Interpretation</CommandItem>
                <CommandItem key="cmd-summary" className="text-xs" onSelect={(v) => { recordContext?.extraToRecord('summary', prompts.recordSummary({ record }), record) }}><TextQuoteIcon /> Summary in one sentence</CommandItem>
                <CommandItem key="cmd-send-all" className="text-xs" onSelect={(v) => { recordContext?.sendAllRecordsToChat(); chatContext.setChatOpen(true); }}><ClipboardPasteIcon /> Add all records to chat context</CommandItem>
                <CommandItem key="cmd-best-next-steps" className="text-xs" onSelect={(v) => { 
                        chatContext.setChatOpen(true);
                        chatContext.sendMessage({
                          message: {
                            role: 'user',
                            createdAt: new Date(),
                            content: prompts.bestNextSteps({ record }),
                          }
                        });                    
                 }}><MoveRight /> What are best next steps?</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Translations">
                {supportedLanguages.map((item) => (
                    <CommandItem key={item.code}  onSelect={(v) => {
                        chatContext.setChatOpen(true);
                        chatContext.sendMessage({
                          message: {
                            role: 'user',
                            createdAt: new Date(),
                            content: prompts.translateRecord({ record, language: item.name }),
                          }
                        });
              
                    }} className="text-xs"><LanguagesIcon /> Translate to {item.name} ({item.country})</CommandItem>
                ))}
            </CommandGroup>
        </CommandList>
    </CommandDialog>)
};

export default RecordItemCommands;


//   {(record.json) ? (
//     <Button size="icon" variant="ghost" title="Analyze & Suggest by AI">
//       <Wand2Icon className="w-4 h-4"  onClick={() => { recordContext?.extraToRecord('interpretation', prompts.recordInterpretation({ record }), record) }} />
//     </Button>                
//   ): (null) }
