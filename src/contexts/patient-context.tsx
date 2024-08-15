import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { PatientDTO } from '@/data/dto';
import { PatientApiClient } from '@/data/client/patient-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';


import { DataLoadingStatus, Patient } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from './config-context';
import { DatabaseContext } from './db-context';
import { toast } from 'sonner';


export type PatientContextType = {
    patients: Patient[];
    currentPatient: Patient | null; 
    addingNewPatient: boolean;
    setAddingNewPatient: (adding: boolean) => void;
    patientEditOpen: boolean;
    setPatientEditOpen: (editMode: boolean) => void;
    patientListPopup: boolean;
    setPatientListPopup: (open: boolean) => void;
    updatePatient: (patient: Patient) => Promise<Patient>;
    deletePatient: (id: number) => Promise<boolean>;
    listPatients: () => Promise<Patient[]>;
    setCurrentPatient: (patient: Patient | null) => void; // new method
    loaderStatus: DataLoadingStatus;
}

export const PatientContext = createContext<PatientContextType | null>(null);

export const PatientContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Idle);
    const [patientListPopup, setPatientListPopup] = useState<boolean>(false);
    const [patientEditOpen, setPatientEditOpen] = useState<boolean>(false);
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null); // new state
    const [addingNewPatient, setAddingNewPatient] = useState<boolean>(false);
    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext);

    useEffect(() => {
        listPatients();
    }, []);
    const setupApiClient = async (config: ConfigContextType | null) => {
        const masterKey = dbContext?.masterKey
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: masterKey,
            useEncryption: true
        };
        const client = new PatientApiClient('', dbContext, encryptionConfig);
        return client;
    }    

    const updatePatient = async (patient: Patient): Promise<Patient> => {
        try {
            const client = await setupApiClient(config);
            const patientDTO = patient.toDTO(); // DTOs are common ground between client and server
            const response = await client.put(patientDTO);
            const newRecord = typeof patient?.id  === 'undefined'
            if (response.status !== 200) {
                console.error('Error adding patient:', response.message);
                toast.error('Error adding patient');

                return patient;
            } else {
                const updatedPatient = Object.assign(patient, { id: response.data.id });
                setPatients(
                    newRecord ? [...patients, updatedPatient] :
                    patients.map(pr => pr.id === patient.id ?  patient : pr)
                )
                return updatedPatient;
            }
        } catch (error) {
            console.error('Error adding patient record:', error);
            toast.error('Error adding patient record');
            return patient;
        }
    };

    const deletePatient = async (record: Patient): Promise <boolean> => {
        const apiClient = await setupApiClient(config);
        const result = await apiClient.delete(record.toDTO())
        if(result.status !== 200) {
            toast.error('Error removing patient: ' + result.message)
            return Promise.resolve(false);
        } else {
            toast.success('Patient removed successfully!')
            const updatedPatients = patients.filter((pr) => pr.id !== record.id);
            setPatients(updatedPatients);            
            return Promise.resolve(true);
        }
    }

    const listPatients = async ():Promise<Patient[]>  => {
        const client = await setupApiClient(config);
        setLoaderStatus(DataLoadingStatus.Loading);
        try {
            const apiResponse = await client.get();
            const fetchedPatients = apiResponse.map((patientDTO: PatientDTO) => Patient.fromDTO(patientDTO));
            setPatients(fetchedPatients);
            setLoaderStatus(DataLoadingStatus.Success);
            setCurrentPatient(fetchedPatients.length > 0 ? fetchedPatients[0] : null)
            return fetchedPatients;
        } catch(error) {
            setLoaderStatus(DataLoadingStatus.Error);
            throw (error)
        };
    };

    return (
        <PatientContext.Provider
            value={{ addingNewPatient, setAddingNewPatient, patients, patientListPopup, setPatientListPopup, patientEditOpen, setPatientEditOpen, updatePatient, deletePatient, listPatients, loaderStatus, setCurrentPatient, currentPatient }}
        >
            {children}
        </PatientContext.Provider>
    );
};

