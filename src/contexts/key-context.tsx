import { DataLoadingStatus, Key } from '@/data/client/models';
import React, { createContext, PropsWithChildren, useState } from 'react';

interface KeyContextProps {
    keys: Key[];
    loaderStatus: DataLoadingStatus;
    sharedKeysDialogOpen: boolean;
    currentKey: Key | null;

    loadKeys: () => void;
    addKey: (newKey: Key) => void;
    removeKey: (keyLocatorHash: string) => void;

    setCurrentKey: (key: Key | null) => void;
    setSharedKeysDialogOpen: (value: boolean) => void;
}

export const KeyContext = createContext<KeyContextProps>({
    keys: [],
    loaderStatus: DataLoadingStatus.Idle,
    sharedKeysDialogOpen: false,
    currentKey: null,
    
    loadKeys: () => {},
    addKey: () => {},
    removeKey: () => {},

    setCurrentKey: (key: Key | null)  => {},
    setSharedKeysDialogOpen: () => {},
});

export const KeyContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [keys, setKeys] = useState<Key[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Idle);
    const [sharedKeysDialogOpen, setSharedKeysDialogOpen] = useState(false);
    const [currentKey, setCurrentKey] = useState<Key | null>(null);

    const addKey = (newKey: Key) => {
        setKeys((prevKeys) => [...prevKeys, newKey]);
    };

    const removeKey = (keyLocatorHash: string) => {
        setKeys((prevKeys) => prevKeys.filter((key) => key.keyLocatorHash !== keyLocatorHash));
    };

    const loadKeys = () => {
    }

    return (
        <KeyContext.Provider value={{ keys, loaderStatus, currentKey, sharedKeysDialogOpen, addKey, removeKey, loadKeys, setSharedKeysDialogOpen, setCurrentKey }}>
            {children}
        </KeyContext.Provider>
    );
};