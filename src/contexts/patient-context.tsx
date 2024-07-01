import React, { createContext, useState, useEffect, useContext } from 'react';
import { PatientDTO } from '@/data/dto/patient-dto';
import { PatientApiClient } from '@/data/client/patient-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { ConfigContext } from './config-context';

export type PatientContextType = {
    patients: PatientDTO[];
    addPatient: (patient: PatientDTO) => void;
    editPatient: (patient: PatientDTO) => void;
    deletePatient: (id: number) => void;
    listPatients: () => void;
}

export const PatientContext = createContext<PatientContextType | null>(null);

export const PatientProvider: React.FC = ({ children }) => {
    const [patients, setPatients] = useState<PatientDTO[]>([]);

    useEffect(() => {
        listPatients();
    }, []);

    const config = useContext(ConfigContext);


    const addPatient = (patient: PatientDTO) => {
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: config?.getServerConfig('dataEncryptionMasterKey') as string, // TODO: for entities other than Config we should take the masterKey from server config
            useEncryption: true
          };
          const client = new PatientApiClient('', encryptionConfig);
          client.put(patient).then((response) => {
            if(response.status !== 200) {
                console.error('Error adding patient:', response.message);
            } else {
                setPatients([...patients, Object.assign(patient, { id: response.data.id }) ]);
            }
          });          
    };

    const editPatient = (patient: PatientDTO) => {
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

    const deletePatient = (id: number) => {
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

    const listPatients = () => {
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
            value={{ patients, addPatient, editPatient, deletePatient, listPatients }}
        >
            {children}
        </PatientContext.Provider>
    );
};