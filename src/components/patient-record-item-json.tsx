"use client"
import React, { useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { PatientRecord } from '@/data/client/models';
import { labels } from '@/data/ai/labels';
import { formatString } from 'typescript-string-operations';
import dynamic from 'next/dynamic';
import { JsonEditor } from 'json-edit-react'
import { useTheme } from 'next-themes';
import { PatientRecordContext } from '@/contexts/patient-record-context';

interface Props {
    record: PatientRecord;
}
const PatientRecordItemJson: React.FC<Props> = ({ record }) => {
    const { theme, systemTheme } = useTheme();
    const currentTheme = (theme === 'system' ? systemTheme : theme)
    const patientRecordContext = useContext(PatientRecordContext)

    if (Array.isArray(record.json)) {
        return (
            <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    {(record.json as any[]).map((item, index) => (
                        <AccordionItem key={index} value={'item-' + index}>
                            <AccordionTrigger>{formatString('{0} [{1}]', labels.patientRecordItemLabel(item.type, { record }), item.subtype)}</AccordionTrigger>
                            <AccordionContent>
                                <JsonEditor onUpdate={
                                    (data) => {
                                        record.json[index] = data.newData;
                                        patientRecordContext?.updatePatientRecord(record);
                                    }
                                } data={item} theme={currentTheme === 'dark' ? 'githubDark' : 'githubLight '} />
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
                                <JsonEditor onUpdate={
                                    (data) => {
                                        record.json = data.newData;
                                        patientRecordContext?.updatePatientRecord(record);
                                    }
                                } data={record.json} theme={currentTheme === 'dark' ? 'githubDark' : 'githubLight '}/>
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

export default PatientRecordItemJson;