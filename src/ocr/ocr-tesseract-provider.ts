    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Folder, Record } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { createWorker, OEM, PSM } from 'tesseract.js';
import { ChatContextType, MessageType, MessageVisibility } from '@/contexts/chat-context';
import { toast } from 'sonner';
import { ConfigContextType } from '@/contexts/config-context';
import { prompts } from '@/data/ai/prompts';
import { removePII } from '@/lib/removePII';
import { FolderContextType } from '@/contexts/folder-context';
import { RecordContextType } from '@/contexts/record-context';

export type ImageData = {
    base64Content: string;
    displayName: string;
  };

const processFiles = async (files: DisplayableDataObject[], selectedLanguage: string) => {

    return await (async () => {
      toast.info('Loading Tesseract OCR engine ...');
      const worker = await createWorker(selectedLanguage, OEM.TESSERACT_LSTM_COMBINED, {
        logger: m => console.log(m),
        errorHandler: e => console.error(e),
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0',
      });
      let imagesArray: ImageData[] = []
      
        let textBuffer = ''
        for(const file of files) {
          toast.info('Recognizing file ' + file.name + ' page: ' + (files.indexOf(file) + 1) + ' of ' + files.length);
          const ret = await worker.recognize(file.url, {}, {text: true});
          textBuffer+= ret.data.text;
        }
        await worker.terminate();
        return textBuffer
    })();    

  }

export async function parse(record: Record, chatContext: ChatContextType, configContext: ConfigContextType | null, folderContext: FolderContextType | null, updateRecordFromText: (text: string, record: Record, allowNewRecord: boolean) => Record|null, updateParseProgress: (record: Record, inProgress: boolean, error: any) => void, sourceImages: DisplayableDataObject[]): Promise<AIResultEventType>  {
    return new Promise (async (resolve, reject) => {

        // TODO: add Tesseract parsing logic - then LLM - it should be configurable whichh LLM is being used for data parsing from tesseract text
        toast.info('Sending images to Tesseract for OCR processing...');

        let textAfterOcr = await processFiles(sourceImages, (await configContext?.getServerConfig('ocrLanguage') as string) || 'en');
        console.log(textAfterOcr);

        const removePIIMode = await configContext?.getServerConfig('llmProviderRemovePII') as string;
        const parseAIProvider = await configContext?.getServerConfig('llmProviderParse') as string;

        const parseRequest = async (text:string) => {
            return chatContext.sendMessage({ 
                message: {
                    role: 'user',
                    createdAt: new Date(),
                    type: MessageType.Parse,
                    // visibility: MessageVisibility.ProgressWhileStreaming,
                    content: prompts.recordParseOCR({ record, config: configContext }, text)
                },
                onResult: (resultMessage, result) => {
                    if (result.finishReason !== 'error') {
                        if (result.finishReason === 'length') {
                            toast.error('Too many findings for one record. Try uploading attachments one per record')
                        }

                        resultMessage.recordSaved = true;
                        resultMessage.recordRef = record;
                        updateParseProgress(record, false, null);
                        updateRecordFromText(resultMessage.content, record, false);
                        resolve(result);
                    } else {
                        reject(result);
                    }
                    
                },
                providerName: parseAIProvider
            });
        };

        if (removePIIMode === 'replace' || removePIIMode === 'both') {
            // TODO: add programmatical data removal removing all folder personal data - extend folder to store more personal data to be removed
            const piiTokens:string[] = []
            if (folderContext?.currentFolder) {
                const folderJsonData = folderContext?.currentFolder.json;
                if (folderJsonData) {
                    Object.keys(folderJsonData).forEach((key) => {
                        const piiToken = folderJsonData[key] as string;
                        if (piiToken && piiToken.length > 3) piiTokens.push(folderJsonData[key]);
                    });
                }
                piiTokens.push(folderContext?.currentFolder.name);
                const piiGeneralData: string = (await configContext?.getServerConfig('piiGeneralData') as string) || '';
                if (piiGeneralData) piiTokens.push(...piiGeneralData.split("\n"));    
            }
            console.log('Removing PII Tokens: ', piiTokens)
            textAfterOcr = removePII(textAfterOcr, piiTokens, '***');
        } 
        
        if(removePIIMode === 'ollama' || removePIIMode === 'both') {
            const ollamaUrl = await configContext?.getServerConfig('ollamaUrl') as string;
            if (!ollamaUrl) {
                toast.error('Please configure the Ollama URL in the Settings first in order to remove PII using Ollama')
            } else {
                toast.info('Sending OCR text to Ollama for PII removal...');
                chatContext.sendMessage({ // still using chatgpt only - add support for other LLMS
                    message: {
                        role: 'user',
                        createdAt: new Date(),
                        type: MessageType.Parse,
                        content: prompts.recordRemovePII({ record, config: configContext }, textAfterOcr)
                    },
                    onResult: (resultMessage, result) => {
                        if (result.finishReason !== 'error') {
                            parseRequest(result.text);
                        } else {
                            reject(result);
                        }

                    },
                    providerName: 'ollama'
                });
            }
        }  else {
            parseRequest(textAfterOcr);
        }   
    });
}    