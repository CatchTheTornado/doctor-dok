import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { PatientRecordDTO } from '@/data/dto';
import { PatientRecordApiClient } from '@/data/client/patient-record-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { DataLoadingStatus, Patient, PatientRecord } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from './config-context';
import { toast } from 'sonner';
import { sort } from 'fast-sort';
import { EncryptedAttachmentApiClient } from '@/data/client/encrypted-attachment-api-client';
import { DatabaseContext } from './db-context';

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
}

export const PatientRecordContext = createContext<PatientRecordContextType | null>(null);

export const PatientRecordContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [patientRecordEditMode, setPatientRecordEditMode] = useState<boolean>(false);
    const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [currentPatientRecord, setCurrentPatientRecord] = useState<PatientRecord | null>(null); // new state

    useEffect(() => {
    }, []);

    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext)

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


    return (
        <PatientRecordContext.Provider
            value={{ patientRecords, updatePatientRecord, loaderStatus, setCurrentPatientRecord, currentPatientRecord, listPatientRecords, deletePatientRecord, patientRecordEditMode, setPatientRecordEditMode }}
        >
            {children}
        </PatientRecordContext.Provider>
    );
};
