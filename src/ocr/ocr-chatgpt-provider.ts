    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Patient, PatientRecord } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { AIResultEventType, ChatContextType, MessageVisibility } from '@/contexts/chat-context';
import { ConfigContextType } from '@/contexts/config-context';
import { PatientContextType } from '@/contexts/patient-context';
import { PatientRecordContextType } from '@/contexts/patient-record-context';
import { prompts } from '@/data/ai/prompts';
import { toast } from 'sonner';

export async function parse(record: PatientRecord, chatContext: ChatContextType, configContext: ConfigContextType | null, patientContext: PatientContextType | null, updateRecordFromText: (text: string, record: PatientRecord, allowNewRecord: boolean) => PatientRecord|null,  updateParseProgress: (record: PatientRecord, inProgress: boolean, error: any) => void, sourceImages: DisplayableDataObject[]): Promise<AIResultEventType> {
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
                    if (result.finishReason === 'length') {
                        toast.error('Too many findings for one health record. Try uploading attachments one per health reacord')
                    }

                    resultMessage.recordRef = record;
                    updateParseProgress(record, false, null);
                    resultMessage.recordSaved = true;
                    updateRecordFromText(resultMessage.content, record, false);
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