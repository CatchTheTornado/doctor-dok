import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { DatabaseCreateRequestDTO, KeyHashParamsDTO, PatientRecordDTO } from '@/data/dto';
import { DatabaseAuthorizeRequest, DatabaseAuthStatus, DatabaseCreateRequest, DataLoadingStatus, Patient, PatientRecord } from '@/data/client/models';
import { AuthorizeDbResponse, CreateDbResponse, DbApiClient } from '@/data/client/db-api-client';
import { ConfigContextType } from './config-context';
import { generateEncryptionKey } from '@/lib/crypto';

export type CreateDatabaseResult = {
    success: boolean;
    message: string;
    issues: string[];
}

export type DatabaseContextType = {

    databaseId: string;
    setDatabaseId: (hashId: string) => void;
    masterKey: string;
    setMasterKey: (key: string) => void;
    encryptionKey: string;
    setEncryptionKey: (key: string) => void; 


    databaseHashId: string;
    setDatabaseHashId: (hashId: string) => void;
    keyLocatorHash: string;
    setKeyLocatorHash: (hash: string) => void;

    keyHash: string;
    setKeyHash: (hash: string) => void;

    keyHashParams: KeyHashParamsDTO;
    setKeyHashParams: (params: KeyHashParamsDTO) => void;

    accessToken: string;
    setAccesToken: (hash: string) => void;

    refreshToken: string;
    setRefreshToken: (hash: string) => void;

    authStatus: {
        status: DatabaseAuthStatus
        isAuthorized: () => boolean;
        isError: () => boolean;
        isInProgress: () => boolean;   
    }

    create: (createRequest:DatabaseCreateRequest) => Promise<CreateDatabaseResult>;
    authorize: (authorizeRequest:DatabaseAuthorizeRequest) => Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [databaseId, setDatabaseId] = useState<string>('');
    const [masterKey, setMasterKey] = useState<string>('');
    const [encryptionKey, setEncryptionKey] = useState<string>('');

    const [databaseHashId, setDatabaseHashId] = useState<string>('');
    const [keyLocatorHash, setKeyLocatorHash] = useState<string>('');
    const [keyHash, setKeyHash] = useState<string>('');
    const [keyHashParams, setKeyHashParams] = useState<KeyHashParamsDTO>({
        hashLen: 0,
        salt: '',
        time: 0,
        mem: 0,
        parallelism: 1
    });

    const [accessToken, setAccesToken] = useState<string>('');
    const [refreshToken, setRefreshToken] = useState<string>('');


    const authStatus = {
        status: DatabaseAuthStatus.NotAuthorized,
        isAuthorized: () => {
            return authStatus.status === DatabaseAuthStatus.Authorized;
        },
        isError: () => {
            return authStatus.status === DatabaseAuthStatus.AuthorizationError;
        },
        isInProgress: () => {
            return authStatus.status === DatabaseAuthStatus.InProgress;
        }
    }    

    const setupApiClient = async (config: ConfigContextType | null) => {
        const client = new DbApiClient('');
        return client;
    }
    const create = async (createRequest: DatabaseCreateRequest): Promise<CreateDatabaseResult> => {
        // Implement UC01 hashing and encryption according to https://github.com/CatchTheTornado/patient-pad/issues/65

        const apiClient = await setupApiClient(null);
        apiClient.create({
            databaseIdHash: databaseHashId,
            encryptedMasterKey: masterKey,
            keyHash: keyHash,
            keyHashParams: {
                hashLen: 0,
                salt: '',
                time: 1,
                mem: 16,
                parallelism: 1
            },
            keyLocatorHash: keyLocatorHash,
        });

        return {
            success: true,
            message: 'Database created',
            issues: []
        }
    };

    const authorize = async (authorizeRequest: DatabaseAuthorizeRequest) => {
    };

    const databaseContextValue: DatabaseContextType = {
        databaseId,
        setDatabaseId,
        keyLocatorHash,
        setKeyLocatorHash,
        keyHash,
        setKeyHash,        
        keyHashParams,
        setKeyHashParams,
        databaseHashId,
        setDatabaseHashId,
        masterKey,
        setMasterKey,
        encryptionKey,
        setEncryptionKey,
        authStatus,
        accessToken,
        setAccesToken,
        refreshToken,
        setRefreshToken,       
        create,
        authorize,
    };

    return (
        <DatabaseContext.Provider value={databaseContextValue}>
            {children}
        </DatabaseContext.Provider>
    );
};

