import React, { createContext, useState, useEffect, useContext } from 'react';
import { PatientRecordDTO } from '@/data/dto';
import { PatientRecordApiClient } from '@/data/client/patient-record-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { DataLoadingStatus, Patient, PatientRecord } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from './config-context';

export type PatientRecordContextType = {
    patientRecords: PatientRecord[];
    currentPatientRecord: PatientRecord | null; 
    addPatientRecord: (patientRecord: PatientRecord) => Promise<PatientRecord>;
    editPatientRecord: (patientRecord: PatientRecordDTO) => Promise<PatientRecord>;
    deletePatientRecord: (id: number) => Promise<boolean>;
    listPatientRecords: (forPatient: Patient) => Promise<PatientRecord[]>;
    setCurrentPatientRecord: (patientRecord: PatientRecord | null) => void; // new method
    loaderStatus: DataLoadingStatus;
}

export const PatientRecordContext = createContext<PatientRecordContextType | null>(null);

export const PatientRecordContextProvider: React.FC = ({ children }) => {
    const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [currentPatientRecord, setCurrentPatientRecord] = useState<PatientRecord | null>(null); // new state

    useEffect(() => {
    }, []);

    const config = useContext(ConfigContext);

    const addPatientRecord = async (patientRecord: PatientRecord) => {
        const client = await setupApiClient(config);
        const patientRecordDTO = patientRecord.toDTO(); // DTOs are common ground between client and server
        client.put(patientRecordDTO).then((response) => {
            if (response.status !== 200) {
                console.error('Error adding patient record:', response.message);
            } else {
                const updatedPatientRecord = Object.assign(patientRecord, { id: response.data.id });
                setPatientRecords([...patientRecords, updatedPatientRecord]);
                return Promise.resolve(patientRecord);
            }
        });
    };

    const editPatientRecord = async (patientRecord: PatientRecordDTO) => {
        // Call the API to edit the patient record
        // PatientRecordApiClient.editPatientRecord(patientRecord)
        //     .then((updatedPatientRecord) => {
        //         const updatedPatientRecords = patientRecords.map((pr) =>
        //             pr.id === updatedPatientRecord.id ? updatedPatientRecord : pr
        //         );
        //         setPatientRecords(updatedPatientRecords);
        //     })
        //     .catch((error) => {
        //         console.error('Error editing patient record:', error);
        //     });
    };

    const deletePatientRecord = async (id: number) => {
        // Call the API to delete the patient record
        // PatientRecordApiClient.deletePatientRecord(id)
        //     .then(() => {
        //         const updatedPatientRecords = patientRecords.filter((pr) => pr.id !== id);
        //         setPatientRecords(updatedPatientRecords);
        //     })
        //     .catch((error) => {
        //         console.error('Error deleting patient record:', error);
        //     });
    };

    const listPatientRecords = async (forPatient: Patient) => {
        const client = await setupApiClient(config);
        setLoaderStatus(DataLoadingStatus.Loading);
        client.get().then((response) => {
            const fetchedPatientRecords = response.map((patientRecordDTO: PatientRecordDTO) => PatientRecord.fromDTO(patientRecordDTO));
            setPatientRecords(fetchedPatientRecords);
            setLoaderStatus(DataLoadingStatus.Success);
            setCurrentPatientRecord(fetchedPatientRecords.length > 0 ? fetchedPatientRecords[0] : null)
            return Promise.resolve(fetchedPatientRecords);
        }).catch((error) => {   
            setLoaderStatus(DataLoadingStatus.Error);
            return Promise.reject(error);
        });
    };

    const setupApiClient = async (config: ConfigContextType | null) => {
        const masterKey = await config?.getServerConfig('dataEncryptionMasterKey') as string
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: masterKey,
            useEncryption: true
        };
        const client = new PatientRecordApiClient('', encryptionConfig);
        return client;
    }

    return (
        <PatientRecordContext.Provider
            value={{ patientRecords, addPatientRecord, editPatientRecord, deletePatientRecord, listPatientRecords, loaderStatus, setCurrentPatientRecord, currentPatientRecord }}
        >
            {children}
        </PatientRecordContext.Provider>
    );
};
