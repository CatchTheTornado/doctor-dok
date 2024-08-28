import '@enhances/with-resolvers';
import React, { createContext, useState, useEffect, useContext, PropsWithChildren, useRef } from 'react';
import { EncryptedAttachmentDTO, RecordDTO } from '@/data/dto';
import { RecordApiClient } from '@/data/client/record-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Folder, Record } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from '@/contexts/config-context';
import { toast } from 'sonner';
import { sort } from 'fast-sort';
import { EncryptedAttachmentApiClient } from '@/data/client/encrypted-attachment-api-client';
import { DatabaseContext } from './db-context';
import { ChatContext, CreateMessageEx, MessageVisibility } from './chat-context';
import { convertDataContentToBase64String } from "ai";
import { convert } from '@/lib/pdf2js'
import { pdfjs } from 'react-pdf'
import { prompts } from "@/data/ai/prompts";
import { parse as chatgptParseRecord } from '@/ocr/ocr-chatgpt-provider';
import { parse as tesseractParseRecord } from '@/ocr/ocr-tesseract-provider';
import { FolderContext } from './folder-context';
import { findCodeBlocks, getCurrentTS } from '@/lib/utils';
import { parse } from 'path';
import { sha256 } from '@/lib/crypto';
import { jsonrepair } from 'jsonrepair'
import { GPTTokens } from 'gpt-tokens'


let parseQueueInProgress = false;
let parseQueue:Record[] = []
let parseQueueLength = 0;


export enum URLType {
    data = 'data',
    blob = 'blob'
  }

export type RecordContextType = {
    records: Record[];
    recordEditMode: boolean;
    parseQueueLength: number;
    setRecordEditMode: (editMode: boolean) => void;
    currentRecord: Record | null; 
    updateRecord: (record: Record) => Promise<Record>;
    deleteRecord: (record: Record) => Promise<boolean>;
    listRecords: (forFolder: Folder) => Promise<Record[]>;
    setCurrentRecord: (record: Record | null) => void; // new method
    loaderStatus: DataLoadingStatus;
    operationStatus: DataLoadingStatus;

    updateRecordFromText: (text: string, record: Record, allowNewRecord: boolean) => Record|null;
    getAttachmentDataURL: (attachmentDTO: EncryptedAttachmentDTO, type: URLType) => Promise<string>;
    downloadAttachment: (attachment: EncryptedAttachmentDTO, useCache: boolean) => void;
    convertAttachmentsToImages: (record: Record, statusUpdates: boolean) => Promise<DisplayableDataObject[]>;
    extraToRecord: (type: string, promptText: string, record: Record) => void;
    parseRecord: (record: Record) => void;
    sendRecordToChat: (record: Record, forceRefresh: boolean) => void;
    sendAllRecordsToChat: (customMessage: CreateMessageEx | null, providerName?: string) => void;

    processParseQueue: () => void;
}

export const RecordContext = createContext<RecordContextType | null>(null);

export const RecordContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [recordEditMode, setRecordEditMode] = useState<boolean>(false);
    const [records, setRecords] = useState<Record[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [operationStatus, setOperationStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [currentRecord, setCurrentRecord] = useState<Record | null>(null); // new state

    useEffect(() => {
    }, []);

    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext)
    const chatContext = useContext(ChatContext);
    const folderContext = useContext(FolderContext)

    const cache = async () => {
      return await caches.open('recordContext');      
    }

    const updateRecord = async (record: Record): Promise<Record> => {
        try {
            const client = await setupApiClient(config);
            const recordDTO = record.toDTO(); // DTOs are common ground between client and server
            const response = await client.put(recordDTO);
            const newRecord = typeof record?.id  === 'undefined'

            if (response.status !== 200) {
                console.error('Error adding folder record:', response.message);
                toast.error('Error adding folder record');

                return record;
            } else {
              const updatedRecord = new Record({ ...record, id: response.data.id } as Record);
              setRecords(prevRecords => 
                    newRecord ? [...prevRecords, updatedRecord] :
                    prevRecords.map(pr => pr.id === updatedRecord.id ?  updatedRecord : pr)
                )
                //chatContext.setRecordsLoaded(false); // reload context next time - TODO we can reload it but we need time framed throthling #97
                return updatedRecord;
            }
        } catch (error) {
            console.error('Error adding folder record:', error);
            toast.error('Error adding folder record');
            return record;
        }
    };

    const updateRecordFromText =  (text: string, record: Record | null = null, allowNewRecord = true): Record|null => {
        if (text.indexOf('```json') > -1) {
          const codeBlocks = findCodeBlocks(text.trimEnd().endsWith('```') ? text : text + '```', false);
          let recordJSON = [];
          let recordMarkdown = "";
          if (codeBlocks.blocks.length > 0) {
              for (const block of codeBlocks.blocks) {
                  if (block.syntax === 'json') {
                      const jsonObject = JSON.parse(jsonrepair(block.code));
                      if (Array.isArray(jsonObject)) {
                          for (const recordItem of jsonObject) {
                              recordJSON.push(recordItem);
                          }
                      } else recordJSON.push(jsonObject);
                  }

                  if (block.syntax === 'markdown') {
                      recordMarkdown += block.code;
                  }
              }
              const discoveredType = recordJSON.length > 0 ? recordJSON.map(item => item.subtype ? item.subtype : item.type).join(", ") : 'note';
              if (record) {
                  record = new Record({ ...record, json: recordJSON, text: recordMarkdown, type: discoveredType } as Record);
                  updateRecord(record);
              } else {
                  if (allowNewRecord && folderContext?.currentFolder?.id) { // create new folder Record
                    record = new Record({ folderId: folderContext?.currentFolder?.id, type: discoveredType, createdAt: getCurrentTS(), updatedAt: getCurrentTS(), json: recordJSON, text: recordMarkdown } as Record);
                    updateRecord(record);
                  }
              }
              console.log('JSON repr: ', recordJSON);
          } 
      } else { // create new folder Record
        if (allowNewRecord && folderContext?.currentFolder?.id) { // create new folder Record
          record = new Record({ folderId: folderContext?.currentFolder?.id, type: 'note', createdAt: getCurrentTS(), updatedAt: getCurrentTS(), json: null, text: text } as Record);
          updateRecord(record);
        }
      }
      return record;
    }

    const deleteRecord = async (record: Record) => {
        const prClient = await setupApiClient(config);
        const attClient = await setupAttachmentsApiClient(config);
        if(record.attachments.length > 0) {
          record.attachments.forEach(async (attachment) => {
            const result = await attClient.delete(attachment.toDTO());
            if (result.status !== 200) {
                toast.error('Error removing attachment: ' + attachment.displayName)
            }
          })
        }
        const result = await prClient.delete(record)
        if(result.status !== 200) {
            toast.error('Error removing folder record: ' + result.message)
            return Promise.resolve(false);
        } else {
            toast.success('Folder record removed successfully!')
            setRecords(prvRecords => prvRecords.filter((pr) => pr.id !== record.id));    
            //chatContext.setRecordsLoaded(false); // reload context next time        
            return Promise.resolve(true);
        }
    };

    const listRecords = async (forFolder: Folder) => {
        try {
            const client = await setupApiClient(config);
            setLoaderStatus(DataLoadingStatus.Loading);
            const response = await client.get(forFolder.toDTO());
            const fetchedRecords = response.map((recordDTO: RecordDTO) => Record.fromDTO(recordDTO));
            setRecords(fetchedRecords);
            setLoaderStatus(DataLoadingStatus.Success);
            return fetchedRecords;
        } catch (error) {
            setLoaderStatus(DataLoadingStatus.Error);
            toast.error('Error listing folder records');            
            return Promise.reject(error);
        }    
    };

    const setupApiClient = async (config: ConfigContextType | null) => {
        const masterKey = dbContext?.masterKey;
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: masterKey,
            useEncryption: true
        };
        const client = new RecordApiClient('', dbContext, encryptionConfig);
        return client;
    }

    const setupAttachmentsApiClient = async (config: ConfigContextType | null) => {
        const masterKey = dbContext?.masterKey;
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: masterKey,
            useEncryption: true
        };
        const client = new EncryptedAttachmentApiClient('', dbContext, encryptionConfig);
        return client;
    }

      const getAttachmentDataURL = async(attachmentDTO: EncryptedAttachmentDTO, type: URLType, useCache = true): Promise<string> => {
        const cacheStorage = await cache();
        const cacheKey = `${attachmentDTO.storageKey}-${attachmentDTO.id}-${type}`;
        const attachmentDataUrl = await cacheStorage.match(cacheKey);

        if (attachmentDataUrl && useCache) {
          console.log('Attachment loaded from cache ', attachmentDTO)
          return attachmentDataUrl.text();
        }
    
        console.log('Download attachment', attachmentDTO);
    
        const client = await setupAttachmentsApiClient(config);
        const arrayBufferData = await client.get(attachmentDTO);    
    
        if (type === URLType.blob) {
          const blob = new Blob([arrayBufferData], { type: attachmentDTO.mimeType + ";charset=utf-8" });
          const url = URL.createObjectURL(blob);
          if(useCache) cacheStorage.put(cacheKey, new Response(url))
          return url;
        } else {
          const url = 'data:' + attachmentDTO.mimeType +';base64,' + convertDataContentToBase64String(arrayBufferData);
          if(useCache) cacheStorage.put(cacheKey, new Response(url))
          return url;
        }
      }
    
      const downloadAttachment = async (attachment: EncryptedAttachmentDTO, useCache = true) => {
        try {
          const url = await getAttachmentDataURL(attachment, URLType.blob, useCache);
          window.open(url);    
        } catch (error) {
          toast.error('Error downloading attachment ' + error);
        }
      };
    
      const calcChecksum = async (record: Record): Promise<string> => {
        const attachmentsHash = await sha256(record.attachments.map(ea => ea.storageKey).join('-'), 'attachments')
        const cacheKey = `record-${record.id}-${attachmentsHash}-${dbContext?.databaseHashId}`;

        return cacheKey;
      }

      const convertAttachmentsToImages = async (record: Record, statusUpdates: boolean = true): Promise<DisplayableDataObject[]> => {

        if (!record.attachments || record.attachments.length == 0) return [];

        const attachments = []
        const cacheStorage = await cache();
        const cacheKey = await calcChecksum(record);
        const cachedAttachments = await cacheStorage.match(cacheKey);

        if (cachedAttachments) {
          const deserializedAttachments = await cachedAttachments.json() as DisplayableDataObject[];
          console.log(`Attachment images loaded from cache for ${record.id} - pages: ` + deserializedAttachments.length + ' (' + cacheKey + ')');
          return deserializedAttachments;
        }

        for(const ea of record.attachments){
    
          try {
            if (ea.mimeType === 'application/pdf') {
              if (statusUpdates) toast.info('Downloading file ' + ea.displayName);
              const pdfBase64Content = await getAttachmentDataURL(ea.toDTO(), URLType.data); // convert to images otherwise it's not supported by vercel ai sdk
              if (statusUpdates) toast.info('Converting file  ' + ea.displayName + ' to images ...');
              const imagesArray = await convert(pdfBase64Content, { base64: true }, pdfjs)
              if (statusUpdates) toast.info('File converted to ' + imagesArray.length + ' images');  
              for (let i = 0; i < imagesArray.length; i++){
                attachments.push({
                  name: ea.displayName + ' page ' + (i+1),
                  contentType: 'image/x-png',
                  url: imagesArray[i]
                })
              }
      
            } else {
              attachments.push({
                name: ea.displayName,
                contentType: ea.mimeType,
                url: await getAttachmentDataURL(ea.toDTO(), URLType.data) // TODO: convert PDF attachments to images here
              })
            }
          } catch (error) {
            console.error(error);
            if (statusUpdates) toast.error('Error downloading attachment: ' + error);
          }
        }
        cacheStorage.put(cacheKey, new Response(JSON.stringify(attachments)));
        return attachments;
      }
    
      const extraToRecord = async (type: string, promptText: string, record: Record) => {
    
        chatContext.setChatOpen(true);
          chatContext.sendMessage({
            message: {
              role: 'user',
              createdAt: new Date(),
              content: promptText,
            },
            onResult: (resultMessage, result) => {    
              if (result.finishReason !== 'error') {
                let recordEXTRA = record.extra || []
                recordEXTRA.find(p => p.type === type) ? recordEXTRA = recordEXTRA.map(p => p.type === type ? { ...p, value: result.text } : p) : recordEXTRA.push({ type: type, value: result.text })
                console.log(recordEXTRA);
                record = new Record({ ...record, extra: recordEXTRA });
                updateRecord(record);          
              }
            }
          })
      }
    
      const updateParseProgress = (record: Record, inProgress: boolean, error: any = null) => {
        record.parseError = error;
        record.parseInProgress = inProgress;
        setRecords(prevRecords => prevRecords.map(pr => pr.id === record.id ? record : pr)); // update state
      }

      const processParseQueue = async () => {
        if (parseQueueInProgress) {
          for(const pr of parseQueue) {
            updateParseProgress(pr, true);
          }
          console.log('Parse queue in progress');
          return;
        }

        let record = null;
        parseQueueInProgress = true;
        while (parseQueue.length > 0) {
          try {
//            if (!chatContext.isStreaming) {
              record = parseQueue[0] as Record;
              console.log('Processing record: ', record, parseQueue.length);
              // TODO: add OSS models and OCR support - #60, #59, #61
              updateParseProgress(record, true);
              
              setOperationStatus(DataLoadingStatus.Loading);
              const attachments = await convertAttachmentsToImages(record);
              setOperationStatus(DataLoadingStatus.Success);

              // Parsing is two or thre stage operation: 1. OCR, 2. <optional> sensitive data removal, 3. LLM
              const ocrProvider = await config?.getServerConfig('ocrProvider') || 'chatgpt';
              console.log('Using OCR provider:', ocrProvider);

              if (ocrProvider === 'chatgpt') {
                await chatgptParseRecord(record, chatContext, config, folderContext, updateRecordFromText, updateParseProgress, attachments);
              } else if (ocrProvider === 'tesseract') {
                await tesseractParseRecord(record, chatContext, config, folderContext, updateRecordFromText, updateParseProgress, attachments);
              }
              console.log('Record parsed, taking next record', record);
              parseQueue = parseQueue.slice(1); // remove one item
              parseQueueLength = parseQueue.length;
/*            } else {
              console.log('Waiting for chat to finish streaming');
              await new Promise(r => setTimeout(r, 1000));
            }*/
          } catch (error) {
            parseQueue = parseQueue.slice(1); // remove one item
            parseQueueLength = parseQueue.length;

            if (record) updateParseProgress(record, false, error);
          }
        }
        parseQueueInProgress = false;
      }      
    
      const parseRecord = async (newRecord: Record)=> {
        if (!parseQueue.find(pr => pr.id === newRecord.id) && newRecord.attachments.length > 0) {
          parseQueue.push(newRecord)
          parseQueueLength = parseQueue.length
          console.log('Added to parse queue: ', parseQueue.length);
        }
        processParseQueue();
      }

      const sendAllRecordsToChat = async (customMessage: CreateMessageEx | null = null, providerName?: string) => {
        return new Promise((resolve, reject) => {
          // chatContext.setChatOpen(true);
          if (records.length > 0) {
            const msgs:CreateMessageEx[] = [{
              role: 'user',
              //createdAt: new Date(),
              visibility: MessageVisibility.Hidden, // we don't show folder records context
              content: prompts.recordsToChat({ records, config }),
            }, ...records.map((record) => {
              return {
                role: 'user',
                visibility: MessageVisibility.Hidden, // we don't show folder records context
                //createdAt: new Date(),
                content: prompts.recordIntoChatSimplified({ record })
              }
          }), {
            role: 'user',
            visibility: MessageVisibility.Visible, // we don't show folder records context
            //createdAt: new Date(),
            content: prompts.recordsToChatDone({ records, config }),
          }];

          if(customMessage) msgs.push(customMessage);

            const preUsage = new GPTTokens({
              model   : 'gpt-4o',
              messages: msgs
            });

            console.log('Context msg tokens', preUsage.usedTokens, preUsage.usedUSD);
            chatContext.setRecordsLoaded(true);
            chatContext.sendMessages({
                messages: msgs, providerName, onResult: (resultMessage, result) => {
                console.log('All records sent to chat');
                if (result.finishReason !== 'error') {
                  resolve(result);
                } else {
                  reject(result);
                }
              }
            })
          }
        });
      }
    
      const sendRecordToChat = async (record: Record, forceRefresh: boolean = false) => {
        if (!record.json || forceRefresh) {  // first: parse the record
          await parseRecord(record);
        } else {
          chatContext.setChatOpen(true);
          chatContext.sendMessage({
            message: {
              role: 'user',
              createdAt: new Date(),
              content: prompts.recordIntoChat({ record, config }),
            }
          });
        }
      }    


    return (
        <RecordContext.Provider
            value={{
                 records, 
                 parseQueueLength,
                 updateRecordFromText,
                 updateRecord, 
                 loaderStatus, 
                 operationStatus,
                 setCurrentRecord, 
                 currentRecord, 
                 listRecords, 
                 deleteRecord, 
                 recordEditMode, 
                 setRecordEditMode,
                 getAttachmentDataURL,
                 downloadAttachment,
                 convertAttachmentsToImages,
                 extraToRecord,
                 parseRecord,
                 sendRecordToChat,
                 sendAllRecordsToChat,
                 processParseQueue
                }}
        >
            {children}
        </RecordContext.Provider>
    );
};
