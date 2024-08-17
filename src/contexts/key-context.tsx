import { DataLoadingStatus, Key, KeyACL } from '@/data/client/models';
import { EncryptionUtils, generateEncryptionKey, sha256 } from '@/lib/crypto';
import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { DatabaseContext, DatabaseContextType, defaultDatabaseIdHashSalt, defaultKeyLocatorHashSalt } from './db-context';
import { toast } from 'sonner';
import { KeyACLDTO, KeyDTO } from '@/data/dto';
import { KeyApiClient, PutKeyResponse, PutKeyResponseError } from '@/data/client/key-api-client';
import { ConfigContextType } from './config-context';
import { getCurrentTS } from '@/lib/utils';
const argon2 = require("argon2-browser");

interface KeyContextProps {
    keys: Key[];
    loaderStatus: DataLoadingStatus;
    sharedKeysDialogOpen: boolean;
    changeEncryptionKeyDialogOpen: boolean;
    currentKey: Key | null;

    loadKeys: () => void;
    addKey: (databaseId: string, displayName: string, sharedKey: string, expDate: Date | null, acl: KeyACLDTO) => Promise<PutKeyResponse>;
    removeKey: (keyLocatorHash: string) => Promise<PutKeyResponse>;

    setCurrentKey: (key: Key | null) => void;
    setSharedKeysDialogOpen: (value: boolean) => void;
    setChangeEncryptionKeyDialogOpen: (value: boolean) => void;
}

export const KeyContext = createContext<KeyContextProps>({
    keys: [],
    loaderStatus: DataLoadingStatus.Idle,
    sharedKeysDialogOpen: false,
    changeEncryptionKeyDialogOpen: false,
    currentKey: null,
    
    loadKeys: () => {},
    addKey: (databaseId: string, displayName: string, sharedKey: string, expDate: Date | null, acl: KeyACLDTO) => Promise.resolve({} as PutKeyResponse),
    removeKey: (keyLocatorHash: string) => Promise.resolve({} as PutKeyResponse),

    setCurrentKey: (key: Key | null)  => {},
    setSharedKeysDialogOpen: () => {},
    setChangeEncryptionKeyDialogOpen: () => {},
});

export const KeyContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [keys, setKeys] = useState<Key[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Idle);
    const [sharedKeysDialogOpen, setSharedKeysDialogOpen] = useState(false);
    const [currentKey, setCurrentKey] = useState<Key | null>(null);
    const [changeEncryptionKeyDialogOpen, setChangeEncryptionKeyDialogOpen] = useState(false);
    const dbContext = useContext(DatabaseContext);


    const setupApiClient = async (config: ConfigContextType | null) => {
        const client = new KeyApiClient('', dbContext);
        return client;
    }

    const addKey = async (databaseId: string, displayName: string, sharedKey: string, expDate: Date | null, acl: KeyACLDTO = {
        role: 'guest',
        features: ['*']
    } ): Promise<PutKeyResponse> => {
        // setKeys((prevKeys) => [...prevKeys, newKey]);
        const keyHashParams = {
            salt: generateEncryptionKey(),
            time: 2,
            mem: 16 * 1024,
            hashLen: 32,
            parallelism: 1
        } 
        const keyHash = await argon2.hash({
          pass: sharedKey,
          salt: keyHashParams.salt,
          time: keyHashParams.time,
          mem: keyHashParams.mem,
          hashLen: keyHashParams.hashLen,
          parallelism: keyHashParams.parallelism
        });
        const databaseIdHash = await sha256(databaseId, defaultDatabaseIdHashSalt);
        const keyLocatorHash = await sha256(sharedKey + databaseId, defaultKeyLocatorHashSalt);

        const existingKey = keys.find((key) => key.keyLocatorHash === keyLocatorHash);
        if (existingKey) {
            
            toast.error('Key already exists, please choose a different key!');
            throw new Error('Key already exists');
        }

        const encryptionUtils = new EncryptionUtils(sharedKey);
        const masterKey = await dbContext?.masterKey;
        const encryptedMasterKey = await encryptionUtils.encrypt(masterKey);
        
        const apiClient = await setupApiClient(null);
        const keyDTO: KeyDTO = {
            databaseIdHash,
            encryptedMasterKey,
            keyHash: keyHash.encoded,
            keyHashParams: JSON.stringify(keyHashParams),
            keyLocatorHash,
            displayName,
            acl: JSON.stringify(acl),
            expiryDate: expDate,
            updatedAt: getCurrentTS()
        };

        const result = await apiClient.put(keyDTO);
        
        if(result.status === 200) {
            toast('Shared Key succesfull added. Please send Database Id and Key value to the user you like to share date with.')
        } else {
            toast.error((result as PutKeyResponseError).message);
        }

        return result;

    };

    const removeKey = async (keyLocatorHash: string) => {
        setKeys((prevKeys) => prevKeys.filter((key) => key.keyLocatorHash !== keyLocatorHash));
        const apiClient = await setupApiClient(null);
        return apiClient.delete(keyLocatorHash);
    };

    const loadKeys = async () => {
        const apiClient = await setupApiClient(null);
        const keys = await apiClient.get();
        setKeys(keys.filter(k => k.displayName && (k.acl && (JSON.parse(k.acl) as KeyACLDTO).role !== 'owner') ).map(k=>new Key(k))); // skip keys without display name
    }

    return (
        <KeyContext.Provider value={{ keys, loaderStatus, currentKey, changeEncryptionKeyDialogOpen, sharedKeysDialogOpen, addKey, removeKey, loadKeys, setSharedKeysDialogOpen, setChangeEncryptionKeyDialogOpen, setCurrentKey }}>
            {children}
        </KeyContext.Provider>
    );
};