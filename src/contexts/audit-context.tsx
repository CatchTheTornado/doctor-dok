import { DataLoadingStatus, Key, KeyACL } from '@/data/client/models';
import { EncryptionUtils, generateEncryptionKey, sha256 } from '@/lib/crypto';
import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { DatabaseContext, DatabaseContextType, defaultDatabaseIdHashSalt, defaultKeyLocatorHashSalt } from './db-context';
import { toast } from 'sonner';
import { AuditDTO, KeyACLDTO, KeyDTO } from '@/data/dto';
import { KeyApiClient, PutKeyResponse, PutKeyResponseError } from '@/data/client/key-api-client';
import { ConfigContextType } from '@/contexts/config-context';
import { getCurrentTS } from '@/lib/utils';
import assert from 'assert';
import { AuditApiClient } from '@/data/client/audit-api-client';
const argon2 = require("argon2-browser");

interface AuditContextProps {
    logs: AuditDTO[];
    limit: number;
    currentAudit?: AuditDTO;
    setCurrentAudit: (value: AuditDTO | undefined) => void;
    lastAudit?: AuditDTO;
    setLastAudit: (value: AuditDTO | undefined) => void;
    loaderStatus: DataLoadingStatus;
    setLimit: (value: number) => void;
    setOffset: (value: number) => void;
    offset: number;
    loadLogs: (offset: number, limit: number) => Promise<AuditDTO[]>;
    auditLogOpen: boolean;
    setAuditLogDialogOpen: (value: boolean) => void;
    record: (log: AuditDTO) => Promise<void>;
}

export const AuditContext = createContext<AuditContextProps>({
    limit: 10,
    offset: 0,
    logs: [],
    currentAudit: undefined,
    setCurrentAudit: () => {},
    lastAudit: undefined,
    setLastAudit: () => {},
    loaderStatus: DataLoadingStatus.Idle,
    setLimit: () => {},
    setOffset: () => {},
    loadLogs: async (offset: number, limit: number) => Promise.resolve([]),
    auditLogOpen: false,
    setAuditLogDialogOpen: () => {},
    record: async (log: AuditDTO) => Promise.resolve()
});

export const AuditContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [auditLogOpen, setAuditLogDialogOpen] = useState(false);
    const [logs, setLogs] = useState<AuditDTO[]>([]);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [lastAudit, setLastAudit] = useState<AuditDTO | undefined>(undefined);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Idle);
    const [currentAudit, setCurrentAudit] = useState<AuditDTO | undefined>(undefined);

    const dbContext = useContext(DatabaseContext);

    const setupApiClient = async (config: ConfigContextType | null) => {
        const client = new AuditApiClient('', dbContext, { secretKey: dbContext?.masterKey, useEncryption: true });
        return client;
    }

    const record = async (log: AuditDTO) => {
        const apiClient = await setupApiClient(null);

        apiClient.put(log).then((response) => {
            if (response.status === 200) {
                console.log('Audit log saved', log);
                setLastAudit(log);
            } else {
                toast.error('Error saving audit log ' + response.message);
            }
        }).catch((error) => {
            console.error(error);
            toast.error('Error saving audit log', error);
        });        
    }

    const loadLogs = async (offset: number, limit: number) => {
        const client = await setupApiClient(null);
        const logs = await client.get(offset, limit);
        setLogs(logs);
        return logs;
    }


    return (
        <AuditContext.Provider value={{ setAuditLogDialogOpen, loadLogs, auditLogOpen, limit, offset, setLimit, setOffset, logs, loaderStatus, currentAudit, setCurrentAudit, record, lastAudit }}>
            {children}
        </AuditContext.Provider>
    );
};