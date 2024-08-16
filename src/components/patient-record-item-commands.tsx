"use client"
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Patient, PatientRecord } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import Markdown from 'react-markdown';
import styles from './patient-record-item.module.css'
import remarkGfm from 'remark-gfm'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from './ui/command';

interface Props {
    record: PatientRecord;
    patient?: Patient | null;
    open: boolean;
    setOpen: (value: boolean) => void;
}

const PatientRecordItemCommands: React.FC<Props> = ({ record, patient, open, setOpen }) => {
    return (<CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
        <CommandItem>Calendar</CommandItem>
        <CommandItem>Search Emoji</CommandItem>
        <CommandItem>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
        <CommandItem>Profile</CommandItem>
        <CommandItem>Billing</CommandItem>
        <CommandItem>Settings</CommandItem>
        </CommandGroup>
    </CommandList>
    </CommandDialog>)
};

export default PatientRecordItemCommands;


//   {(record.json) ? (
//     <Button size="icon" variant="ghost" title="Analyze & Suggest by AI">
//       <Wand2Icon className="w-4 h-4"  onClick={() => { patientRecordContext?.extraToRecord('interpretation', prompts.patientRecordInterpretation({ record }), record) }} />
//     </Button>                
//   ): (null) }
