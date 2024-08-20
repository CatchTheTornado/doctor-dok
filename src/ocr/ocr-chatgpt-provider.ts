    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Patient, PatientRecord } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { AIResultEventType, ChatContextType, MessageVisibility } from '@/contexts/chat-context';
import { ConfigContextType } from '@/contexts/config-context';
import { PatientContextType } from '@/contexts/patient-context';
import { PatientRecordContextType } from '@/contexts/patient-record-context';
import { prompts } from '@/data/ai/prompts';

export async function parse(record: PatientRecord, chatContext: ChatContextType, configContext: ConfigContextType | null, patientContext: PatientContextType | null, updateRecordFromText: (text: string, record: PatientRecord) => PatientRecord|null,  updateParseProgress: (record: PatientRecord, inProgress: boolean, error: any) => void, sourceImages: DisplayableDataObject[]): Promise<AIResultEventType> {
    return new Promise ((resolve, reject) => {
        chatContext.sendMessage({
            message: {
                role: 'user',
                // visibility: MessageVisibility.ProgressWhileStreaming,
                createdAt: new Date(),
                content: prompts.patientRecordParseMultimodal({ record, config: configContext }),
                experimental_attachments: sourceImages
            },
            onResult: (resultMessage, result) => {
                if (result.finishReason !== 'error') {
                    resultMessage.recordRef = record;
                    updateParseProgress(record, false, null);
                    resultMessage.recordSaved = true;
                    updateRecordFromText(resultMessage.content, record);
                }

                if(result.finishReason === 'error') {
                    reject(result);
                } else {
                    resolve(result);
                }
            }
        });
    });
}    