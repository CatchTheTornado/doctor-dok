    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Folder, Record } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { AIResultEventType, ChatContextType, MessageType, MessageVisibility } from '@/contexts/chat-context';
import { ConfigContextType } from '@/contexts/config-context';
import { FolderContextType } from '@/contexts/folder-context';
import { RecordContextType } from '@/contexts/record-context';
import { prompts } from '@/data/ai/prompts';
import { toast } from 'sonner';

export async function parse(record: Record, chatContext: ChatContextType, configContext: ConfigContextType | null, folderContext: FolderContextType | null, updateRecordFromText: (text: string, record: Record, allowNewRecord: boolean) => Record|null,  updateParseProgress: (record: Record, inProgress: boolean, error: any) => void, sourceImages: DisplayableDataObject[]): Promise<AIResultEventType> {
    const parseAIProvider = await configContext?.getServerConfig('llmProviderParse') as string;

    return new Promise ((resolve, reject) => {
        chatContext.sendMessage({
            message: {
                role: 'user',
                // visibility: MessageVisibility.ProgressWhileStreaming,
                createdAt: new Date(),
                type: MessageType.Parse,
                content: prompts.recordParseMultimodal({ record, config: configContext }),
                experimental_attachments: sourceImages
            },
            onResult: async (resultMessage, result) => {
                if (result.finishReason !== 'error') {
                    if (result.finishReason === 'length') {
                        toast.error('Too many findings for one record. Try uploading attachments one per record')
                    }

                    resultMessage.recordRef = record;
                    updateParseProgress(record, false, null);
                    resultMessage.recordSaved = true;
                    await record.updateChecksumLastParsed();
                    updateRecordFromText(resultMessage.content, record, false);
                }

                if(result.finishReason === 'error') {
                    reject(result);
                } else {
                    resolve(result);
                }
            },
            providerName: parseAIProvider
        });
    });
}    