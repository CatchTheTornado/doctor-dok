"use client"
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { PatientRecord } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import dynamic from 'next/dynamic';
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface Props {
    record: PatientRecord;
}
const PatientRecordItemJson: React.FC<Props> = ({ record }) => {
    if (Array.isArray(record.json)) {
        return (
            <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    {(record.json as any[]).map((item, index) => (
                        <AccordionItem key={index} value={'item-' + index}>
                            <AccordionTrigger>{formatString('{0} [{1}]', labels.patientRecordItemLabel(item.type, { record }), item.subtype)}</AccordionTrigger>
                            <AccordionContent>
                                <JsonView data={item} style={defaultStyles}/>
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
                            <JsonView data={record.json} style={defaultStyles}/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }
};

export default PatientRecordItemJson;