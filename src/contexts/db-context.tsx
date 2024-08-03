import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { DatabaseCreateRequestDTO, KeyHashParamsDTO, PatientRecordDTO } from '@/data/dto';
import { DatabaseAuthorizeRequest, DatabaseAuthStatus, DatabaseCreateRequest, DataLoadingStatus, Patient, PatientRecord } from '@/data/client/models';
import { AuthorizeDbResponse, CreateDbResponse, DbApiClient } from '@/data/client/db-api-client';
import { ConfigContextType } from './config-context';
import { EncryptionUtils, generateEncryptionKey, sha256 } from '@/lib/crypto';
import getConfig from 'next/config';
const argon2 = require("argon2-browser");


export type AuthorizeDatabaseResult = {
    success: boolean;
    message: string;
    issues: string[];
}

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

    authStatus: DatabaseAuthStatus;
    setAuthStatus: (status: DatabaseAuthStatus) => void;

    create: (createRequest:DatabaseCreateRequest) => Promise<CreateDatabaseResult>;
    authorize: (authorizeRequest:DatabaseAuthorizeRequest) => Promise<AuthorizeDatabaseResult>;
    logout: () => void;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseContextProvider: React.FC<PropsWithChildren> = ({ children }) => {

    // the salts are static as they're used as record locators in the DB - once changed the whole DB needs to be re-hashed
    // note: these salts ARE NOT used to hash passwords etc. (for this purpose we generate a dynamic per-user-key hash - below)
    const defaultDatabaseIdHashSalt = process.env.NEXT_PUBLIC_DATABASE_ID_HASH_SALT || 'ooph9uD4cohN9Eechog0nohzoon9ahra';
    const defaultKeyLocatorHashSalt = process.env.NEXT_PUBLIC_KEY_LOCATOR_HASH_SALT || 'daiv2aez4thiewaegahyohNgaeFe2aij';

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

    const [authStatus, setAuthStatus] = useState<DatabaseAuthStatus>(DatabaseAuthStatus.NotAuthorized);

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
        const databaseIdHash = await sha256(createRequest.databaseId, defaultDatabaseIdHashSalt);
        const keyLocatorHash = await sha256(createRequest.key + createRequest.databaseId, defaultKeyLocatorHashSalt);

        const encryptionUtils = new EncryptionUtils(createRequest.key);
        const masterKey = generateEncryptionKey()
        const encryptedMasterKey = await encryptionUtils.encrypt(masterKey);
        
        const apiClient = await setupApiClient(null);
        const apiRequest = {
            databaseIdHash,
            encryptedMasterKey,
            keyHash: keyHash.encoded,
            keyHashParams: JSON.stringify(keyHashParams),
            keyLocatorHash,
        };
        console.log(apiRequest);
        const apiResponse = await apiClient.create(apiRequest);

        if(apiResponse.status === 200) { // user is virtually logged in
            setDatabaseHashId(databaseIdHash);
            setDatabaseId(createRequest.databaseId);
            setKeyLocatorHash(keyLocatorHash);
            setKeyHash(keyHash.encoded);
            setKeyHashParams(keyHashParams);
            setMasterKey(masterKey);
            setEncryptionKey(createRequest.key);
        }

        return {
            success: apiResponse.status === 200,
            message: apiResponse.message,
            issues: apiResponse.issues ? apiResponse.issues : []
        }
    };

    const logout = () => {
        setDatabaseId('');
        setMasterKey('');
        setEncryptionKey('');
        setDatabaseHashId('');
        setKeyLocatorHash('');
        setKeyHash('');
        setKeyHashParams({
            hashLen: 0,
            salt: '',
            time: 0,
            mem: 0,
            parallelism: 1
        });
        setAccesToken('');
        setRefreshToken('');
        setAuthStatus(DatabaseAuthStatus.NotAuthorized);
    };

    const authorize = async (authorizeRequest: DatabaseAuthorizeRequest): Promise<AuthorizeDatabaseResult> => {
        setAuthStatus(DatabaseAuthStatus.InProgress);
        const databaseIdHash = await sha256(authorizeRequest.databaseId, defaultDatabaseIdHashSalt);
        const keyLocatorHash = await sha256(authorizeRequest.key + authorizeRequest.databaseId, defaultKeyLocatorHashSalt);
        const apiClient = await setupApiClient(null);

        const authChallengResponse = await apiClient.authorizeChallenge({
            databaseIdHash,
            keyLocatorHash
        });
        
        if (authChallengResponse.status === 200){ // authorization challenge success
            const keyHashParams = authChallengResponse.data as KeyHashParamsDTO;
            console.log(authChallengResponse);

            const keyHash = await argon2.hash({
                pass: authorizeRequest.key,
                salt: keyHashParams.salt,
                time: keyHashParams.time,
                mem: keyHashParams.mem,
                hashLen: keyHashParams.hashLen,
                parallelism: keyHashParams.parallelism
              });

            const authResponse = await apiClient.authorize({
                databaseIdHash,
                keyHash: keyHash.encoded,
                keyLocatorHash
            });

            if(authResponse.status === 200) { // user is virtually logged in
                const encryptionUtils = new EncryptionUtils(authorizeRequest.key);

                setDatabaseHashId(databaseIdHash);
                setDatabaseId(authorizeRequest.databaseId);
                setKeyLocatorHash(keyLocatorHash);
                setKeyHash(keyHash.encoded);
                setKeyHashParams(keyHashParams);

                const encryptedMasterKey = (authResponse as AuthorizeDbResponse).data.encryptedMasterKey;
                setMasterKey(await encryptionUtils.decrypt(encryptedMasterKey));
                setEncryptionKey(authorizeRequest.key);

                setAccesToken((authResponse as AuthorizeDbResponse).data.accessToken);
                setRefreshToken((authResponse as AuthorizeDbResponse).data.refreshToken);
                setAuthStatus(DatabaseAuthStatus.Authorized);
                return {
                    success: true,
                    message: authResponse.message,
                    issues: authResponse.issues ? authResponse.issues : []
                }

            } else {
                setAuthStatus(DatabaseAuthStatus.AuthorizationError);
                return {
                    success: false,
                    message: authResponse.message,
                    issues: authResponse.issues ? authResponse.issues : []
                }
            }
        }

        return {
            success: authChallengResponse.status === 200,
            message: authChallengResponse.message,
            issues: authChallengResponse.issues ? authChallengResponse.issues : []
        }        
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
        setAuthStatus,
        accessToken,
        setAccesToken,
        refreshToken,
        setRefreshToken,       
        create,
        authorize,
        logout
    };

    return (
        <DatabaseContext.Provider value={databaseContextValue}>
            {children}
        </DatabaseContext.Provider>
    );
};

