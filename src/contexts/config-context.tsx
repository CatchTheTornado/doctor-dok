'use client'
import { ApiEncryptionConfig } from '@/data/client/base-api-client';
import { ConfigApiClient } from '@/data/client/config-api-client';
import { generateEncryptionKey } from '@/lib/crypto';
import { getCurrentTS } from '@/lib/utils';
import { useEffectOnce } from 'react-use';
import React, { PropsWithChildren, useReducer } from 'react';
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

function configReducer(state: ConfigContextType, action: Action): ConfigContextType {
  switch (action.type) {
    case 'SET_LOCAL_CONFIG':{
      if (typeof localStorage !== 'undefined'){ 
          if(state.localConfig.saveToLocalStorage || (action.key === 'saveToLocalStorage')) {
            localStorage.setItem(action.key, action.value as string);          
          }
      }

      if (action.key === 'encryptionKey') { // if encryption key is changed, we need to re-encrypt whole server configuration
        if (action.value !== state.localConfig.encryptionKey) {
          const client = getConfigApiClient(action.value as string);
          for (const key in state.serverConfig) {
            client.put({ key, value: state.serverConfig[key] as string, updatedAt: getCurrentTS() }); // update server config value
          }
        }
      }
       
      return {
        ...state,
        localConfig: { ...state.localConfig, [action.key]: action.value },
      };
    }
    case 'SET_SERVER_CONFIG': { // TODO: add API call to update server config
      const client = getConfigApiClient(state.getLocalConfig('encryptionKey') as string);
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
}

export const ConfigContext = React.createContext<ConfigContextType | null>(null);
export const ConfigContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // load config from local storage
  initialState.localConfig.encryptionKey = (typeof localStorage !== 'undefined') && localStorage.getItem("encryptionKey") || ""; // it's important to load it here as it's used by settings popup
  initialState.localConfig.chatGptApiKey = (typeof localStorage !== 'undefined') && localStorage.getItem("chatGptApiKey") || "" ;
  initialState.localConfig.saveToLocalStorage = (typeof localStorage !== 'undefined') && localStorage.getItem("saveToLocalStorage") === "true";
  const [state, dispatch] = useReducer(configReducer, initialState);
  const [serverConfigLoaded, setServerConfigLoaded] = React.useState(false);


  const loadServerConfigOnce = async (): Promise<Record<string, ConfigSupportedValueType>>  => { 
    if(!serverConfigLoaded) {
      const client = getConfigApiClient((typeof localStorage !== 'undefined') && localStorage.getItem("encryptionKey") || "");
      let serverConfigData: Record<string, ConfigSupportedValueType> = {};

      const configs = await client.get();
      for (const config of configs) {
        serverConfigData[config.key] = config.value; // convert out from ConfigDTO to key=>value
      }
      dispatch({ type: 'LOAD_SERVER_CONFIG', config: serverConfigData });
      setServerConfigLoaded(true);

      if(!serverConfigData['dataEncryptionMasterKey']) { // no master key set - generate one
        const key = generateEncryptionKey()
        dispatch({ type: 'SET_SERVER_CONFIG', key: 'dataEncryptionMasterKey', value: key });
        serverConfigData['dataEncryptionMasterKey'] = key;
      }
    
      return serverConfigData
    } else {
      return state.serverConfig;       // already loaded
    }
  }

  useEffectOnce(() => {
  }, []);
  
    const value = {
      ...state,
      setLocalConfig: (key: string, value: ConfigSupportedValueType) =>
        dispatch({ type: 'SET_LOCAL_CONFIG', key, value }),
      getLocalConfig: (key: string) => state.localConfig[key],
      setServerConfig: (key: string, value: ConfigSupportedValueType) =>
        dispatch({ type: 'SET_SERVER_CONFIG', key, value }),
      getServerConfig: async (key: string) => {
        const serverConfig =await loadServerConfigOnce();
        return serverConfig[key];
      },
      setSaveToLocalStorage: (value: boolean) => { 
        dispatch({ type: 'SET_LOCAL_CONFIG', key: 'saveToLocalStorage', value });
        if(!value) {
          for (const k in state.localConfig) {
            localStorage.removeItem(k);
          }    
        } else {
          for (const k in state.localConfig) {
            localStorage.setItem(k, state.localConfig[k]);
          }           
        }
      },
    };
  
    return (
      <ConfigContext.Provider value={value}>
        {children}
      </ConfigContext.Provider>
    );
  }