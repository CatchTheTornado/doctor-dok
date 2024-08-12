    
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Patient, PatientRecord } from '@/data/client/models';
import { findCodeBlocks } from "@/lib/utils";
import { createWorker, OEM, PSM } from 'tesseract.js';
import { ChatContextType } from '@/contexts/chat-context';
import { toast } from 'sonner';
import { ConfigContextType } from '@/contexts/config-context';
import { prompts } from '@/data/ai/prompts';

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

export async function parse(record: PatientRecord, chatContext: ChatContextType, configContext: ConfigContextType, sourceImages: DisplayableDataObject[], updatePatientRecord: (record: PatientRecord) => void) {
    // TODO: add Tesseract parsing logic - then LLM - it should be configurable whichh LLM is being used for data parsing from tesseract text
    toast.info('Sending images to Tesseract for OCR processing...');

    chatContext.setChatOpen(true);

    let textAfterOcr = await processFiles(sourceImages, (await configContext?.getServerConfig('ocrLanguage') as string) || 'en');
    console.log(textAfterOcr);

    const removePIIMode = await configContext?.getServerConfig('llmProviderRemovePII') as string;
    const chatAIProvider = await configContext?.getServerConfig('llmProviderChat') as string;

    const parseRequest = async (text:string) => {
        return chatContext.sendMessage({ // still using chatgpt only - add support for other LLMS
            message: {
                role: 'user',
                createdAt: new Date(),
                content: prompts.patientRecordParseOCR({ record, config: configContext }, text)
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
        }, chatAIProvider);
    };

    if (removePIIMode === 'replace') {
        // TODO: add programmatical data removal removing all patient personal data - extend patient to store more personal data to be removed
    
    } else if(removePIIMode === 'ollama') {
        const ollamaUrl = await configContext?.getServerConfig('ollamaUrl') as string;
        if (!ollamaUrl) {
            toast.error('Please configure the Ollama URL in the Settings first in order to remove PII using Ollama')
        } else {
            toast.info('Sending OCR text to Ollama for PII removal...');
            chatContext.sendMessage({ // still using chatgpt only - add support for other LLMS
                message: {
                    role: 'user',
                    createdAt: new Date(),
                    content: prompts.patientRecordRemovePII({ record, config: configContext }, textAfterOcr)
                },
                onResult: (resultMessage, result) => {
                    parseRequest(result.text);
                }
            }, 'ollama');
        }
    }    
}    