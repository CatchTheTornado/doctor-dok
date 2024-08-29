'use client'
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { ConfigApiClient } from '@/data/client/config-api-client';
import { getCurrentTS } from '@/lib/utils';
import { useEffectOnce } from 'react-use';
import React, { PropsWithChildren, useContext, useReducer, useRef } from 'react';
import { DatabaseContext, DatabaseContextType } from './db-context';
import { DatabaseAuthStatus } from '@/data/client/models';
import {Mutex, Semaphore, withTimeout} from 'async-mutex';

function isNumber(value:any){
  return !isNaN(value);
}

export function coercedVal(val: any, defaultVal: any = ''): ConfigSupportedValueType {
  if (val === '' || val === undefined || val === 'null') return defaultVal;
  if (val === 'true') return true; // booleans are not supported by sqlite so we're converting them on input and outputse
  if (val === 'false') return false;
  if (isNumber(val)) return Number(val);

  return val;
}

export const ENV_PROVIDED_CONFIG = {
  chatGptApiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
  displayAttachmentPreviews: process.env.NEXT_PUBLIC_DISPLAY_ATTACHMENT_PREVIEWS,
  ocrProvider: process.env.NEXT_PUBLIC_OCR_PROVIDER,
  ocrLanguage: process.env.NEXT_PUBLIC_OCR_LANGUAGE,
  ollamaUrl: process.env.NEXT_PUBLIC_OLLAMA_URL,
  ollamaModel: process.env.NEXT_PUBLIC_OLLAMA_MODEL,
  llmProviderChat: process.env.NEXT_PUBLIC_LLM_PROVIDER_CHAT,
  llmProviderParse: process.env.NEXT_PUBLIC_LLM_PROVIDER_PARSE,
  llmProviderRemovePII: process.env.NEXT_PUBLIC_LLM_PROVIDER_REMOVE_PII,
  piiGeneralData: process.env.NEXT_PUBLIC_PII_GENERAL_DATA,
  autoLoadFolderContext: process.env.NEXT_PUBLIC_AUTO_LOAD_PATIENT_CONTEXT,
}

type ConfigSupportedValueType = string | number | boolean | null | undefined;

export type ConfigContextType = {
    localConfig: Record<string, ConfigSupportedValueType>;
    serverConfig: Record<string, ConfigSupportedValueType>;

    setLocalConfig(key: string, value: ConfigSupportedValueType): void;
    getLocalConfig(key: string): ConfigSupportedValueType;

    setServerConfig(key: string, value: ConfigSupportedValueType): Promise<boolean>;
    getServerConfig(key: string): Promise<ConfigSupportedValueType>;
    setSaveToLocalStorage(value: boolean): void;

    isConfigDialogOpen: boolean;
    setConfigDialogOpen: (value: boolean) => void;
}

function getConfigApiClient(encryptionKey: string, dbContext?: DatabaseContextType | null): ConfigApiClient {
  const encryptionConfig: ApiEncryptionConfig = {
    secretKey: encryptionKey, // TODO: for entities other than Config we should take the masterKey from server config
    useEncryption: encryptionKey !== null
  };
  return new ConfigApiClient('', dbContext, encryptionConfig);  
}

export const ConfigContext = React.createContext<ConfigContextType | null>(null);
export const ConfigContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
let serverConfigLoaded = useRef(false);
const configMutex = useRef(new Mutex());
let serverConfig = useRef<Record<string, ConfigSupportedValueType>>({});
let localConfig: Record<string, ConfigSupportedValueType> = {};

const dbContext = useContext(DatabaseContext);
const [isConfigDialogOpen, setConfigDialogOpen] = React.useState(false);

  const loadServerConfig = async (forceReload: boolean = false): Promise<Record<string, ConfigSupportedValueType>>  => { 
      return await configMutex.current.runExclusive(async () => {
        if((!serverConfigLoaded.current || forceReload) && dbContext?.authStatus === DatabaseAuthStatus.Authorized) {
          try {
            console.log('Mutex acquired. Loading server config');
            const client = getConfigApiClient(dbContext?.masterKey as string, dbContext);
            let serverConfigData: Record<string, ConfigSupportedValueType> = {};

            const configs = await client.get();
            for (const config of configs) {
              serverConfigData[config.key] = config.value; // convert out from ConfigDTO to key=>value
            }
            serverConfig.current = serverConfigData;
            serverConfigLoaded.current = true;
            return serverConfigData
          } catch (e){ 
            throw e;
          }
        } else {
          return serverConfig.current;       // already loaded
        }
    });
  }


  useEffectOnce(() => {
  });
  
    const value = {
      localConfig,
      serverConfig: serverConfig.current,
      isConfigDialogOpen,
      setConfigDialogOpen,
      setLocalConfig: (key: string, value: ConfigSupportedValueType) =>
        {
          if (typeof localStorage !== 'undefined'){ 
            if(localConfig.saveToLocalStorage || (key === 'saveToLocalStorage')) {
              localStorage.setItem(key, value as string);          
            }
          }
          localConfig = ({ ...localConfig, [key]: value });
        },
      getLocalConfig: (key: string) => {
        if (typeof localConfig[key] !== 'undefined') {
          return coercedVal(localConfig[key]);
        } else {
          return coercedVal(ENV_PROVIDED_CONFIG[key]);
        }
      },
      setServerConfig: (key: string, value: ConfigSupportedValueType) =>
      {
        if (dbContext?.authStatus === DatabaseAuthStatus.Authorized) {
          const client = getConfigApiClient(dbContext.masterKey as string, dbContext);
          return client.put({ key, value: `${value}`, updatedAt: getCurrentTS() });
        } else {
          return Promise.resolve(false);
        }
      },
      getServerConfig: async (key: string) => {
        const serverConfig  = await loadServerConfig();
        const val = serverConfig[key];
        if (serverConfig && typeof serverConfig[key] !== 'undefined') {
          return coercedVal(val);
        } else {
            return coercedVal(ENV_PROVIDED_CONFIG[key]);
        }
      },
    };
  
    return (
      <ConfigContext.Provider value={value}>
        {children}
      </ConfigContext.Provider>
    );
  }