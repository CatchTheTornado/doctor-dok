import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { DatabaseCreateRequestDTO, KeyHashParamsDTO, PatientRecordDTO } from '@/data/dto';
import { DatabaseAuthorizeRequest, DatabaseAuthStatus, DatabaseCreateRequest, DataLoadingStatus, Patient, PatientRecord } from '@/data/client/models';
import { AuthorizeDbResponse, CreateDbResponse, DbApiClient } from '@/data/client/db-api-client';
import { ConfigContextType } from './config-context';
import { EncryptionUtils, generateEncryptionKey, sha256 } from '@/lib/crypto';
import getConfig from 'next/config';
const argon2 = require("argon2-browser");


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

        const keyHashParams = {
            salt: generateEncryptionKey(),
            time: 2,
            mem: 16 * 1024,
            hashLen: 32,
            parallelism: 1
        } 
        const keyHash = await argon2.hash({
          pass: createRequest.key,
          salt: keyHashParams.salt,
          time: keyHashParams.time,
          mem: keyHashParams.mem,
          hashLen: keyHashParams.hashLen,
          parallelism: keyHashParams.parallelism
        });
        const { publicRuntimeConfig } = getConfig()
        const databaseIdHash = await sha256(createRequest.key, publicRuntimeConfig.defaultDatabaseIdHashSalt);
        const keyLocatorHash = await sha256(createRequest.key + createRequest.databaseId, publicRuntimeConfig.defaultKeyLocatorHashSalt);

        const encryptionUtils = new EncryptionUtils(createRequest.key);
        const encryptedMasterKey = await encryptionUtils.encrypt(generateEncryptionKey());
        
        const apiClient = await setupApiClient(null);
        const apiRequest = {
            databaseIdHash,
            encryptedMasterKey,
            keyHash,
            keyHashParams,
            keyLocatorHash,
        };
        console.log(apiRequest);
        const apiResponse = await apiClient.create(apiRequest);

        return {
            success: apiResponse.status === 200,
            message: apiResponse.message,
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

