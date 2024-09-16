import { DataLoadingStatus } from '@/data/client/models';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { DatabaseContext } from './db-context';
import { toast } from 'sonner';
import { ConfigContextType } from '@/contexts/config-context';
import { TermApiClient } from '@/data/client/term-api-client';
import { TermDTO } from '@/data/dto';
import { sha256 } from '@/lib/crypto';
import { useSearchParams } from 'next/navigation';
import { SaasApiClient } from '@/data/client/saas-api-client';


interface SaaSContextProps {
    quota: {
        allowedDatabases: number,
        allowedUSDBudget: number,
        allowedTokenBudget: number
    },
    usage: {
        usedDatabases: number,
        usedUSDBudget: number,
        usedTokenBudget: number
    },
    email: string | null;
    userId: string | null;
    saasToken: string | null;
    setSaasToken: (token: string) => void;
}

export const SaaSContext = createContext<SaaSContextProps>({
    quota: {
        allowedDatabases: 0,
        allowedUSDBudget: 0,
        allowedTokenBudget: 0
    },
    usage: {
        usedDatabases: 0,
        usedUSDBudget: 0,
        usedTokenBudget: 0
    },
    email: null,
    userId: null,
    saasToken: null,
    setSaasToken: (token: string) => {}
});

export const SaaSContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const dbContext = useContext(DatabaseContext);
    const [saasToken, setSaasToken] = useState<string | null>(null);
    const [quota, setQuota] = useState({
        allowedDatabases: 0,
        allowedUSDBudget: 0,
        allowedTokenBudget: 0
    });
    const [usage, setUsage] = useState({
        usedDatabases: 0,
        usedUSDBudget: 0,
        usedTokenBudget: 0
    });
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const searchParams = useSearchParams();


    const setupApiClient = async (config: ConfigContextType | null) => {
        const client = new SaasApiClient('', dbContext);
        return client;
    }

 
    useEffect(() => {
        const loadSaaSContext = async () => {
            const saasToken = searchParams?.get('saasToken')
            if(saasToken) {
                if (typeof localStorage !== 'undefined')
                    localStorage.setItem('saasToken', saasToken);
                setSaasToken(saasToken);

                const client = await setupApiClient(null);
                const saasAccount = await client.get(saasToken);
                setQuota(saasAccount.quota);
                setUsage(saasAccount.usage);
                setEmail(saasAccount.email || null);
                setUserId(saasAccount.userId || null);
            }
        }
        loadSaaSContext();
    }, [searchParams]);
    


    return (
        <SaaSContext.Provider value={{ 
            quota,
            usage,
            saasToken,
            email,
            userId,
            setSaasToken
         }}>
            {children}
        </SaaSContext.Provider>
    );
};