import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { PatientRecord } from '@/data/client/models';
import ReactJson from 'react-json-view'
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';

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
                                <ReactJson theme="paraiso" src={item} />
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
                            <ReactJson src={record.json} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }
};

export default PatientRecordItemJson;