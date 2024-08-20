import '@enhances/with-resolvers';
import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { EncryptedAttachmentDTO, PatientRecordDTO } from '@/data/dto';
import { PatientRecordApiClient } from '@/data/client/patient-record-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { DataLoadingStatus, DisplayableDataObject, EncryptedAttachment, Patient, PatientRecord } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from './config-context';
import { toast } from 'sonner';
import { sort } from 'fast-sort';
import { EncryptedAttachmentApiClient } from '@/data/client/encrypted-attachment-api-client';
import { DatabaseContext } from './db-context';
import { ChatContext, MessageVisibility } from './chat-context';
import { convertDataContentToBase64String } from "ai";
import { convert } from '@/lib/pdf2js'
import { pdfjs } from 'react-pdf'
import { prompts } from "@/data/ai/prompts";
import { parse as chatgptParseRecord } from '@/ocr/ocr-chatgpt-provider';
import { parse as tesseractParseRecord } from '@/ocr/ocr-tesseract-provider';
import { PatientContext } from './patient-context';
import { findCodeBlocks, getCurrentTS } from '@/lib/utils';
import { parse } from 'path';

export enum URLType {
    data = 'data',
    blob = 'blob'
  }

export type PatientRecordContextType = {
    patientRecords: PatientRecord[];
    patientRecordEditMode: boolean;
    setPatientRecordEditMode: (editMode: boolean) => void;
    currentPatientRecord: PatientRecord | null; 
    updatePatientRecord: (patientRecord: PatientRecord) => Promise<PatientRecord>;
    deletePatientRecord: (record: PatientRecord) => Promise<boolean>;
    listPatientRecords: (forPatient: Patient) => Promise<PatientRecord[]>;
    setCurrentPatientRecord: (patientRecord: PatientRecord | null) => void; // new method
    loaderStatus: DataLoadingStatus;
    operationStatus: DataLoadingStatus;

    updateRecordFromText: (text: string, record: PatientRecord) => PatientRecord|null;
    getAttachmentDataURL: (attachmentDTO: EncryptedAttachmentDTO, type: URLType) => Promise<string>;
    downloadAttachment: (attachment: EncryptedAttachmentDTO) => void;
    convertAttachmentsToImages: (record: PatientRecord, statusUpdates: boolean) => Promise<DisplayableDataObject[]>;
    extraToRecord: (type: string, promptText: string, record: PatientRecord) => void;
    parsePatientRecord: (record: PatientRecord) => void;
    sendHealthReacordToChat: (record: PatientRecord, forceRefresh: boolean) => void;
    sendAllRecordsToChat: () => void;

    processParseQueue: () => void;
}

export const PatientRecordContext = createContext<PatientRecordContextType | null>(null);

export const PatientRecordContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [patientRecordEditMode, setPatientRecordEditMode] = useState<boolean>(false);
    const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [operationStatus, setOperationStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [currentPatientRecord, setCurrentPatientRecord] = useState<PatientRecord | null>(null); // new state

    const [parseQueueInProgress, setParseQueueInProgress] = useState<boolean>(false);
    const [parseQueue, setParseQueue] = useState<PatientRecord[]>([]);

    useEffect(() => {
    }, []);

    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext)
    const chatContext = useContext(ChatContext);
    const patientContext = useContext(PatientContext)


    const updatePatientRecord = async (patientRecord: PatientRecord): Promise<PatientRecord> => {
        try {
            const client = await setupApiClient(config);
            const patientRecordDTO = patientRecord.toDTO(); // DTOs are common ground between client and server
            const response = await client.put(patientRecordDTO);
            const newRecord = typeof patientRecord?.id  === 'undefined'
            if (response.status !== 200) {
                console.error('Error adding patient record:', response.message);
                toast.error('Error adding patient record');

                return patientRecord;
            } else {
                const updatedPatientRecord = Object.assign(patientRecord, { id: response.data.id });
                setPatientRecords(
                    newRecord ? [...patientRecords, updatedPatientRecord] :
                    patientRecords.map(pr => pr.id === updatedPatientRecord.id ?  updatedPatientRecord : pr)
                )
                chatContext.setPatientRecordsLoaded(false); // reload context next time
                return updatedPatientRecord;
            }
        } catch (error) {
            console.error('Error adding patient record:', error);
            toast.error('Error adding patient record');
            return patientRecord;
        }
    };

    const updateRecordFromText =  (text: string, record: PatientRecord | null = null): PatientRecord|null => {
        if (text.indexOf('```json') > -1) {
          const codeBlocks = findCodeBlocks(text.trimEnd().endsWith('```') ? text : text + '```', false);
          let recordJSON = [];
          let recordMarkdown = "";
          if (codeBlocks.blocks.length > 0) {
              for (const block of codeBlocks.blocks) {
                  if (block.syntax === 'json') {
                      const jsonObject = JSON.parse(block.code);
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
                  record = new PatientRecord({ ...record, json: recordJSON, text: recordMarkdown, type: discoveredType } as PatientRecord);
                  updatePatientRecord(record);
              } else {
                  if (patientContext?.currentPatient?.id) { // create new patient Record
                    record = new PatientRecord({ patientId: patientContext?.currentPatient?.id, type: discoveredType, createdAt: getCurrentTS(), updatedAt: getCurrentTS(), json: recordJSON, text: recordMarkdown } as PatientRecord);
                    updatePatientRecord(record);
                  }
              }
              console.log('JSON repr: ', recordJSON);
          } 
      } else { // create new patient Record
        if (patientContext?.currentPatient?.id) { // create new patient Record
          record = new PatientRecord({ patientId: patientContext?.currentPatient?.id, type: 'note', createdAt: getCurrentTS(), updatedAt: getCurrentTS(), json: null, text: text } as PatientRecord);
          updatePatientRecord(record);
        }
      }
      return record;
    }

    const deletePatientRecord = async (record: PatientRecord) => {
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
            toast.error('Error removing patient record: ' + result.message)
            return Promise.resolve(false);
        } else {
            toast.success('Patient record removed successfully!')
            const updatedPatientRecords = patientRecords.filter((pr) => pr.id !== record.id);
            setPatientRecords(updatedPatientRecords);    
            chatContext.setPatientRecordsLoaded(false); // reload context next time        
            return Promise.resolve(true);
        }
    };

    const listPatientRecords = async (forPatient: Patient) => {
        try {
            const client = await setupApiClient(config);
            setLoaderStatus(DataLoadingStatus.Loading);
            const response = await client.get(forPatient.toDTO());
            const fetchedPatientRecords = response.map((patientRecordDTO: PatientRecordDTO) => PatientRecord.fromDTO(patientRecordDTO));
            setPatientRecords(fetchedPatientRecords);
            setLoaderStatus(DataLoadingStatus.Success);
            return fetchedPatientRecords;
        } catch (error) {
            setLoaderStatus(DataLoadingStatus.Error);
            toast.error('Error listing patient records');            
            return Promise.reject(error);
        }    
    };

    const setupApiClient = async (config: ConfigContextType | null) => {
        const masterKey = dbContext?.masterKey;
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: masterKey,
            useEncryption: true
        };
        const client = new PatientRecordApiClient('', dbContext, encryptionConfig);
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

      const getAttachmentDataURL = async(attachmentDTO: EncryptedAttachmentDTO, type: URLType): Promise<string> => {
        console.log('Download attachment', attachmentDTO);
    
        const client = await setupAttachmentsApiClient(config);
        const arrayBufferData = await client.get(attachmentDTO);    
    
        if (type === URLType.blob) {
          const blob = new Blob([arrayBufferData], { type: attachmentDTO.mimeType + ";charset=utf-8" });
          const url = URL.createObjectURL(blob);
          return url;
        } else {
          const url = 'data:' + attachmentDTO.mimeType +';base64,' + convertDataContentToBase64String(arrayBufferData);
          return url;
        }
      }
    
      const downloadAttachment = async (attachment: EncryptedAttachmentDTO) => {
        try {
          const url = await getAttachmentDataURL(attachment, URLType.blob);
          window.open(url);    
        } catch (error) {
          toast.error('Error downloading attachment ' + error);
        }
      };
    
      const convertAttachmentsToImages = async (record: PatientRecord, statusUpdates: boolean = true): Promise<DisplayableDataObject[]> => {
        const attachments = []
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
        return attachments;
      }
    
      const extraToRecord = async (type: string, promptText: string, record: PatientRecord) => {
    
        chatContext.setChatOpen(true);
          chatContext.sendMessage({
            message: {
              role: 'user',
              createdAt: new Date(),
              content: promptText,
            },
            onResult: (resultMessage, result) => {    
              let recordEXTRA = record.extra || []
              recordEXTRA.find(p => p.type === type) ? recordEXTRA = recordEXTRA.map(p => p.type === type ? { ...p, value: result.text } : p) : recordEXTRA.push({ type: type, value: result.text })
              console.log(recordEXTRA);
              record = new PatientRecord({ ...record, extra: recordEXTRA });
              updatePatientRecord(record);          
            }
          })
      }
    
      const updateParseProgress = (record: PatientRecord, inProgress: boolean, error: any = null) => {
        record.parseError = error;
        record.parseInProgress = inProgress;
        setPatientRecords(patientRecords.map(pr => pr.id === record.id ? record : pr)); // update state
      }

      const processParseQueue = async () => {
        if (parseQueueInProgress) {
          console.log('Parse queue in progress');
          return;
        }

        let record = null;
        setParseQueueInProgress(true);
        while (parseQueue.length > 0) {
          try {
            record = parseQueue.pop() as PatientRecord;
            setParseQueue(parseQueue); // after pop - TODO: test if it's really removed
            console.log('Processing record: ', record.id, parseQueue.length);
            // TODO: add OSS models and OCR support - #60, #59, #61
            updateParseProgress(record, true);
            
            setOperationStatus(DataLoadingStatus.Loading);
            const attachments = await convertAttachmentsToImages(record);
            setOperationStatus(DataLoadingStatus.Success);

            // Parsing is two or thre stage operation: 1. OCR, 2. <optional> sensitive data removal, 3. LLM
            const ocrProvider = await config?.getServerConfig('ocrProvider') || 'chatgpt';
            console.log('Using OCR provider:', ocrProvider);

            if (ocrProvider === 'chatgpt') {
              await chatgptParseRecord(record, chatContext, config, patientContext, updateRecordFromText, updateParseProgress, attachments);
            } else if (ocrProvider === 'tesseract') {
              await tesseractParseRecord(record, chatContext, config, patientContext, updateRecordFromText, updateParseProgress, attachments);
            }
          } catch (error) {
            if (record) updateParseProgress(record, false, error);
          }
        }
        setParseQueueInProgress(false);        
      }      
    
      const parsePatientRecord = async (newRecord: PatientRecord)=> {
        if (!parseQueue.find(pr => pr.id === newRecord.id)) {
          setParseQueue([...parseQueue, newRecord]); // add to parse Queue
          console.log('Added to parse queue: ', parseQueue.length);
        }
        processParseQueue();
      }

      const sendAllRecordsToChat = async () => {
        // chatContext.setChatOpen(true);
        if (patientRecords.length > 0) {
          chatContext.setPatientRecordsLoaded(true);
          chatContext.sendMessages({
              messages: [{
                role: 'user',
                createdAt: new Date(),
                visibility: MessageVisibility.Hidden, // we don't show patient records context
                content: prompts.patientRecordsToChat({ patientRecords, config }),
              }, ...patientRecords.map((record) => {
                return {
                  role: 'user',
                  visibility: MessageVisibility.Hidden, // we don't show patient records context
                  createdAt: new Date(),
                  content: prompts.patientRecordIntoChatSimplified({ record })
                }
            }), {
              role: 'user',
              visibility: MessageVisibility.Visible, // we don't show patient records context
              createdAt: new Date(),
              content: prompts.patientRecordsToChatDone({ patientRecords, config }),
            }], onResult: (resultMessage, result) => {
              console.log('All records sent to chat');
            }
          })
        }
      }
    
      const sendHealthReacordToChat = async (record: PatientRecord, forceRefresh: boolean = false) => {
        if (!record.json || forceRefresh) {  // first: parse the record
          await parsePatientRecord(record);
        } else {
          chatContext.setChatOpen(true);
          chatContext.sendMessage({
            message: {
              role: 'user',
              createdAt: new Date(),
              content: prompts.patientRecordIntoChat({ record, config }),
            }
          });
        }
      }    


    return (
        <PatientRecordContext.Provider
            value={{
                 patientRecords, 
                 updateRecordFromText,
                 updatePatientRecord, 
                 loaderStatus, 
                 operationStatus,
                 setCurrentPatientRecord, 
                 currentPatientRecord, 
                 listPatientRecords, 
                 deletePatientRecord, 
                 patientRecordEditMode, 
                 setPatientRecordEditMode,
                 getAttachmentDataURL,
                 downloadAttachment,
                 convertAttachmentsToImages,
                 extraToRecord,
                 parsePatientRecord,
                 sendHealthReacordToChat,
                 sendAllRecordsToChat,
                processParseQueue
                }}
        >
            {children}
        </PatientRecordContext.Provider>
    );
};
