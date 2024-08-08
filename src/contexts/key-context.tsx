import { Key } from '@/data/client/models';
import React, { createContext, useState } from 'react';

interface KeyContextProps {
    keys: Key[];
    addKey: (newKey: Key) => void;
    removeKey: (keyLocatorHash: string) => void;
}

export const KeyContext = createContext<KeyContextProps>({
    keys: [],
    addKey: () => {},
    removeKey: () => {},
});

export const KeyProvider: React.FC = ({ children }) => {
    const [keys, setKeys] = useState<Key[]>([]);

    const addKey = (newKey: Key) => {
        setKeys((prevKeys) => [...prevKeys, newKey]);
    };

    const removeKey = (keyLocatorHash: string) => {
        setKeys((prevKeys) => prevKeys.filter((key) => key.keyLocatorHash !== keyLocatorHash));
    };

    return (
        <KeyContext.Provider value={{ keys, addKey, removeKey }}>
            {children}
        </KeyContext.Provider>
    );
};