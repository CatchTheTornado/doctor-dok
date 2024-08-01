'use client'
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { ConfigApiClient } from '@/data/client/config-api-client';
import { getCurrentTS } from '@/lib/utils';
import { useEffectOnce } from 'react-use';
import React, { PropsWithChildren, useContext, useReducer } from 'react';
import { DatabaseContext } from './db-context';

type ConfigSupportedValueType = string | number | boolean | null | undefined;

export type ConfigContextType = {
    localConfig: Record<string, ConfigSupportedValueType>;
    serverConfig: Record<string, ConfigSupportedValueType>;

    setLocalConfig(key: string, value: ConfigSupportedValueType): void;
    getLocalConfig(key: string): ConfigSupportedValueType;

    setServerConfig(key: string, value: ConfigSupportedValueType): Promise<boolean>;
    getServerConfig(key: string): Promise<ConfigSupportedValueType>;
    setSaveToLocalStorage(value: boolean): void;
    loadServerConfigOnce(): Promise<Record<string, ConfigSupportedValueType>>;
}

type Action =
  | { type: 'SET_LOCAL_CONFIG'; key: string; value: ConfigSupportedValueType }
  | { type: 'SET_SERVER_CONFIG'; key: string; value: ConfigSupportedValueType }
  | { type: 'LOAD_SERVER_CONFIG'; config: Record<string, ConfigSupportedValueType> };

const initialState: ConfigContextType = {
  localConfig: {},
  serverConfig: {},
  setLocalConfig: () => {},
  getLocalConfig: () => null,
  setServerConfig: async  () => Promise.resolve(true),
  getServerConfig: async () => Promise.resolve(null),
  setSaveToLocalStorage: () => {},
  loadServerConfigOnce: async () => Promise.resolve({})
};

function getConfigApiClient(encryptionKey: string): ConfigApiClient {
  const encryptionConfig: ApiEncryptionConfig = {
    secretKey: encryptionKey, // TODO: for entities other than Config we should take the masterKey from server config
    useEncryption: encryptionKey !== null
  };
  return new ConfigApiClient('', encryptionConfig);  
}

export const ConfigContext = React.createContext<ConfigContextType | null>(null);
export const ConfigContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
const [serverConfigLoaded, setServerConfigLoaded] = React.useState(false);
const dbContext = useContext(DatabaseContext);

  // load config from local storage
const [state, dispatch] = useReducer((state: ConfigContextType, action: Action): ConfigContextType  => {
    switch (action.type) {
      case 'SET_LOCAL_CONFIG':{
        if (typeof localStorage !== 'undefined'){ 
            if(state.localConfig.saveToLocalStorage || (action.key === 'saveToLocalStorage')) {
              localStorage.setItem(action.key, action.value as string);          
            }
        }
        
        return {
          ...state,
          localConfig: { ...state.localConfig, [action.key]: action.value },
        };
      }
      case 'SET_SERVER_CONFIG': { // TODO: add API call to update server config
        const client = getConfigApiClient(dbContext?.masterKey as string);
        client.put({ key: action.key, value: action.value as string, updatedAt: getCurrentTS() }); // update server config value
        return {
          ...state,
          serverConfig: { ...state.serverConfig, [action.key]: action.value },
        };
      }
      case 'LOAD_SERVER_CONFIG':
        return {
          ...state,
          serverConfig: action.config,
        };
      default:
        return state;
    }
  }, initialState);

  const loadServerConfig = async (forceReload: boolean = false): Promise<Record<string, ConfigSupportedValueType>>  => { 
    if((!serverConfigLoaded || forceReload) && dbContext?.authStatus.isAuthorized()) {
      const client = getConfigApiClient(dbContext?.masterKey as string);
      let serverConfigData: Record<string, ConfigSupportedValueType> = {};

      const configs = await client.get();
      for (const config of configs) {
        serverConfigData[config.key] = config.value; // convert out from ConfigDTO to key=>value
      }
      dispatch({ type: 'LOAD_SERVER_CONFIG', config: serverConfigData });
      setServerConfigLoaded(true);
  
      return serverConfigData
    } else {
      return state.serverConfig;       // already loaded
    }
  }


  useEffectOnce(() => {
  });
  
    const value = {
      ...state,
      setLocalConfig: (key: string, value: ConfigSupportedValueType) =>
        dispatch({ type: 'SET_LOCAL_CONFIG', key, value }),
      getLocalConfig: (key: string) => state.localConfig[key],
      setServerConfig: (key: string, value: ConfigSupportedValueType) =>
        dispatch({ type: 'SET_SERVER_CONFIG', key, value }),
      getServerConfig: async (key: string) => {
        const { serverConfig } = await loadServerConfig();
        return serverConfig[key];
      },
    };
  
    return (
      <ConfigContext.Provider value={value}>
        {children}
      </ConfigContext.Provider>
    );
  }