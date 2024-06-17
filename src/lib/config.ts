import { ConfigDTO } from '@/data/dto';
import { useEffect, useState } from 'react';
import { encrypt, generateEncryptionKey, shallowEncryptDTO } from './crypto';

export async function set (configs: ConfigDTO[], key: string, value: any) {
    // update the state
    const updatedConfigs = configs.map((config) => config.key === key ? { ...config, value } : config);
    // setConfigs(updatedConfigs);
    // update the server
    fetch(`/api/config`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(await shallowEncryptDTO({ key: key, value: value }, generateEncryptionKey())), // TODO: load encryption key from app state / localstorage
    });
    return true;
}


// config is encrypted with user key; the rest of the data is encrypted with the master key
export const useConfig = (): { configs: ConfigDTO[], get: (arg0:string) => any, getCryptoMasterKey: () => string } => {
    const [configs, setConfigs] = useState<ConfigDTO[]>([]);
    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const response = await fetch('/api/config');
                const data = await response.json();
                setConfigs(data);
            } catch (error) {
                console.error('Error fetching configs:', error);
            }
        };

        fetchConfigs();
    }, []);

    return { configs, 
             get: (key: string) => configs.find((config) => config.key === key),
             getCryptoMasterKey: () => configs.find((config) => config.key === 'encryption.masterKey')?.value || '',
            }
};

export default useConfig;