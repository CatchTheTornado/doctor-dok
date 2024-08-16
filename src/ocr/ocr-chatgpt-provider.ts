    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Patient, PatientRecord } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { ChatContextType } from '@/contexts/chat-context';
import { ConfigContextType } from '@/contexts/config-context';
import { PatientContextType } from '@/contexts/patient-context';
import { prompts } from '@/data/ai/prompts';

export async function parse(record: PatientRecord, chatContext: ChatContextType, configContext: ConfigContextType | null, patientContext: PatientContextType | null,  sourceImages: DisplayableDataObject[], updatePatientRecord: (record: PatientRecord) => void) {
    chatContext.setChatOpen(true);

    chatContext.sendMessage({
        message: {
            role: 'user',
            createdAt: new Date(),
            content: prompts.patientRecordParseMultimodal({ record, config: configContext }),
            experimental_attachments: sourceImages
        },
        onResult: (resultMessage, result) => {
            if (result.text.indexOf('```json') > -1) {
                const codeBlocks = findCodeBlocks(result.text.trimEnd().endsWith('```') ? result.text : result.text + '```', false);
                let recordJSON = [];
                let recordMarkdown = "";
                if (codeBlocks.blocks.length > 0) {
                    for (const block of codeBlocks.blocks) {
                        if (block.syntax === 'json') {
                            const jsonObject = JSON.parse(block.code);
                            if (Array.isArray(jsonObject)) {
                                for (const record of jsonObject) {
                                    recordJSON.push(record);
                                }
                            } else recordJSON.push(jsonObject);
                        }

                        if (block.syntax === 'markdown') {
                            recordMarkdown += block.code;
                        }
                    }

                    if (record) {
                        const discoveredType = recordJSON.length > 0 ? recordJSON.map(item => item.type).join(", ") : 'note';
                        record = new PatientRecord({ ...record, json: recordJSON, text: recordMarkdown, type: discoveredType });
                        updatePatientRecord(record);
                    }
                    console.log('JSON repr: ', recordJSON);
                }
            }
        }
    });
}    