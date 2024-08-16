    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Patient, PatientRecord } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { ChatContextType } from '@/contexts/chat-context';
import { ConfigContextType } from '@/contexts/config-context';
import { PatientContextType } from '@/contexts/patient-context';
import { PatientRecordContextType } from '@/contexts/patient-record-context';
import { prompts } from '@/data/ai/prompts';

export async function parse(record: PatientRecord, chatContext: ChatContextType, configContext: ConfigContextType | null, patientContext: PatientContextType | null, updateRecordFromText: (text: string, record: PatientRecord) => PatientRecord|null,  sourceImages: DisplayableDataObject[]) {
    chatContext.setChatOpen(true);

    chatContext.sendMessage({
        message: {
            role: 'user',
            createdAt: new Date(),
            content: prompts.patientRecordParseMultimodal({ record, config: configContext }),
            experimental_attachments: sourceImages
        },
        onResult: (resultMessage, result) => {
            resultMessage.recordSaved = true;
            updateRecordFromText(resultMessage.content, record);
        }
    });
}    