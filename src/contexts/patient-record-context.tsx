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
import { ChatContext } from './chat-context';
import { convertDataContentToBase64String } from "ai";
import { convert } from '@/lib/pdf2js'
import { pdfjs } from 'react-pdf'
import { prompts } from "@/data/ai/prompts";
import { parse as chatgptParseRecord } from '@/ocr/ocr-chatgpt-provider';
import { parse as tesseractParseRecord } from '@/ocr/ocr-tesseract-provider';

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

    getAttachmentDataURL: (attachmentDTO: EncryptedAttachmentDTO, type: URLType) => Promise<string>;
    downloadAttachment: (attachment: EncryptedAttachmentDTO) => void;
    convertAttachmentsToImages: (record: PatientRecord) => Promise<DisplayableDataObject[]>;
    extraToRecord: (type: string, promptText: string, record: PatientRecord) => void;
    parsePatientRecord: (record: PatientRecord, parsePromptText:string) => void;
    sendHealthReacordToChat: (record: PatientRecord, forceRefresh: boolean) => void;
}

export const PatientRecordContext = createContext<PatientRecordContextType | null>(null);

export const PatientRecordContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [patientRecordEditMode, setPatientRecordEditMode] = useState<boolean>(false);
    const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [operationStatus, setOperationStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [currentPatientRecord, setCurrentPatientRecord] = useState<PatientRecord | null>(null); // new state

    useEffect(() => {
    }, []);

    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext)
    const chatContext = useContext(ChatContext);


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
                return updatedPatientRecord;
            }
        } catch (error) {
            console.error('Error adding patient record:', error);
            toast.error('Error adding patient record');
            return patientRecord;
        }
    };

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
        const url = await getAttachmentDataURL(attachment, URLType.blob);
        window.open(url);    
      };
    
      const convertAttachmentsToImages = async (record: PatientRecord): Promise<DisplayableDataObject[]> => {
        const attachments = []
        for(const ea of record.attachments){
    
          if (ea.mimeType === 'application/pdf') {
            const pdfBase64Content = await getAttachmentDataURL(ea.toDTO(), URLType.data); // convert to images otherwise it's not supported by vercel ai sdk
            const imagesArray = await convert(pdfBase64Content, { base64: true }, pdfjs)
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
    
    
      const parsePatientRecord = async (record: PatientRecord, parsePromptText:string)=> {
        // TODO: add OSS models and OCR support - #60, #59, #61
        setOperationStatus(DataLoadingStatus.Loading);
        const attachments = await convertAttachmentsToImages(record);
        setOperationStatus(DataLoadingStatus.Success);


        // Parsing is two or thre stage operation: 1. OCR, 2. <optional> sensitive data removal, 3. LLM
        const ocrProvider = await config?.getServerConfig('ocrProvider') || 'chatgpt';
        console.log('Using OCR provider:', ocrProvider);

        if (ocrProvider === 'chatgpt') {
          chatgptParseRecord(record, chatContext, parsePromptText, attachments, updatePatientRecord);
        } else if (ocrProvider === 'tesseract') {
          toast('Tesseract OCR is not supported yet');
        }
      }
    
      const sendHealthReacordToChat = async (record: PatientRecord, forceRefresh: boolean = false) => {
        if (!record.json || forceRefresh) {  // first: parse the record
          await parsePatientRecord(record, prompts.patientRecordParse({ record, config }));
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
                 sendHealthReacordToChat
                }}
        >
            {children}
        </PatientRecordContext.Provider>
    );
};
