"use client"
import React, { useContext, useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Record } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import { useTheme } from 'next-themes';
import { RecordContext } from '@/contexts/record-context';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import JsonViewEditor from '@uiw/react-json-view/editor';
import { useHighlight } from '@uiw/react-json-view';

interface Props {
    record: Record;
}
  
const RecordItemJson: React.FC<Props> = ({ record }) => {
    const { theme, systemTheme } = useTheme();
    const currentTheme = (theme === 'system' ? systemTheme : theme)
    const recordContext = useContext(RecordContext)

    if (Array.isArray(record.json)) {
        return (
            <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    {(record.json as any[]).map((item, index) => (
                        <AccordionItem key={index} value={'item-' + index}>
                            <AccordionTrigger>{formatString('{0} [{1}]', labels.recordItemLabel(item.type, { record }), item.subtype)}</AccordionTrigger>
                            <AccordionContent>
                                <JsonViewEditor value={item} style={currentTheme === 'dark' ? githubDarkTheme : githubLightTheme } />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        );
    } else {
        if (record.json) {
            return (
                <div className="w-full">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Structured results</AccordionTrigger>
                            <AccordionContent>
                                <JsonViewEditor value={record.json} style={currentTheme === 'dark' ? githubDarkTheme : githubLightTheme }/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            );
        } else {
            return null;
        }
    }
};

export default RecordItemJson;