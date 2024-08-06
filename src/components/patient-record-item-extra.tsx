"use client"
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { PatientRecord } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import Markdown from 'react-markdown';
import styles from './patient-record-item.module.css'
import remarkGfm from 'remark-gfm'

interface Props {
    record: PatientRecord;
}
const PatientRecordItemExtra: React.FC<Props> = ({ record }) => {
    if (Array.isArray(record.extra)) {
        return (
            <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    {(record.extra as any[]).map((item, index) => (
                        <AccordionItem key={index} value={'item-' + index}>
                            <AccordionTrigger>{formatString('{0} [{1}]', labels.patientRecordItemLabel(item.type, { record }), item.subtype)}</AccordionTrigger>
                            <AccordionContent>
                                <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{item}</Markdown>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        );
    } else {
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

export default PatientRecordItemExtra;