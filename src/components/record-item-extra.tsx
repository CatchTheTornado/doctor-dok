"use client"
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Record } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import Markdown from 'react-markdown';
import styles from './record-item.module.css'
import remarkGfm from 'remark-gfm'

interface Props {
    record: Record;
}
const RecordItemExtra: React.FC<Props> = ({ record }) => {
    if (Array.isArray(record.extra)) {
        return (
            <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    {(record.extra as any[]).map((item, index) => (
                        <AccordionItem key={index} value={'item-' + index}>
                            <AccordionTrigger>{formatString('{0}', labels.recordItemLabel(item.type, { record }))}</AccordionTrigger>
                            <AccordionContent>
                                <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{item.value}</Markdown>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        );
    } else if (record.extra) {
        return (
            <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Structured results</AccordionTrigger>
                        <AccordionContent>
                            <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{record.extra}</Markdown>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }
};

export default RecordItemExtra;