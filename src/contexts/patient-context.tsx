import React, { createContext, useState, useEffect, useContext } from 'react';
import { PatientDTO } from '@/data/dto';
import { PatientApiClient } from '@/data/client/patient-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';


import { DataLoadingStatus, Patient } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from './config-context';


export type PatientContextType = {
    patients: Patient[];
    currentPatient: Patient | null; 
    addPatient: (patient: Patient) => Promise<Patient>;
    editPatient: (patient: PatientDTO) => Promise<Patient>;
    deletePatient: (id: number) => Promise<boolean>;
    listPatients: () => Promise<Patient[]>;
    setCurrentPatient: (patient: Patient | null) => void; // new method
    loaderStatus: DataLoadingStatus;
}

export const PatientContext = createContext<PatientContextType | null>(null);

export const PatientContextProvider: React.FC = ({ children }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Loading);
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null); // new state

    useEffect(() => {
        listPatients();
    }, []);

    const config = useContext(ConfigContext);


    const addPatient = async (patient: Patient) => {
        const client = await setupApiClient(config);
        const patientDTO = patient.toDTO(); // DTOs are common ground between client and server
        client.put(patientDTO).then((response) => {
            if (response.status !== 200) {
                console.error('Error adding patient:', response.message);
            } else {
                const updatedPatient = Object.assign(patient, { id: response.data.id });
                setPatients([...patients, updatedPatient]);
                return Promise.resolve(patient);
            }
        });
    };
    

    // TODO: Implement the editPatient and deletePatient functions
    const editPatient = async (patient: PatientDTO) => {
        // // Call the API to edit the patient
        // PatientApiClient.editPatient(patient)
        //     .then((updatedPatient) => {
        //         const updatedPatients = patients.map((p) =>
        //             p.id === updatedPatient.id ? updatedPatient : p
        //         );
        //         setPatients(updatedPatients);
        //     })
        //     .catch((error) => {
        //         console.error('Error editing patient:', error);
        //     });
    };

    const deletePatient = async (id: number) => {
        // // Call the API to delete the patient
        // PatientApiClient.deletePatient(id)
        //     .then(() => {
        //         const updatedPatients = patients.filter((p) => p.id !== id);
        //         setPatients(updatedPatients);
        //     })
        //     .catch((error) => {
        //         console.error('Error deleting patient:', error);
        //     });
    };

    const listPatients = async () => {
        const client = await setupApiClient(config);
        setLoaderStatus(DataLoadingStatus.Loading);
        client.get().then((response) => {
            const fetchedPatients = response.map((patientDTO: PatientDTO) => Patient.fromDTO(patientDTO));
            setPatients(fetchedPatients);
            setLoaderStatus(DataLoadingStatus.Success);
            setCurrentPatient(fetchedPatients.length > 0 ? fetchedPatients[0] : null)
            return Promise.resolve(fetchedPatients);
        }).catch((error) => {   
            setLoaderStatus(DataLoadingStatus.Error);
            return Promise.reject(error);
        });
        // // Call the API to list all patients
        // PatientApiClient.listPatients()
        //     .then((fetchedPatients) => {
        //         setPatients(fetchedPatients);
        //     })
        //     .catch((error) => {
        //         console.error('Error listing patients:', error);
        //     });
    };

    return (
        <PatientContext.Provider
            value={{ patients, addPatient, editPatient, deletePatient, listPatients, loaderStatus, setCurrentPatient, currentPatient }}
        >
            {children}
        </PatientContext.Provider>
    );
};

async function setupApiClient(config: ConfigContextType | null) {
    const masterKey = await config?.getServerConfig('dataEncryptionMasterKey') as string
    const encryptionConfig: ApiEncryptionConfig = {
        secretKey: masterKey,
        useEncryption: true
    };
    const client = new PatientApiClient('', encryptionConfig);
    return client;
}
