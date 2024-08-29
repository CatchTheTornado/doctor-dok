import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { FolderDTO } from '@/data/dto';
import { FolderApiClient } from '@/data/client/folder-api-client';
import { ApiEncryptionConfig } from '@/data/client/base-api-client';


import { DataLoadingStatus, Folder } from '@/data/client/models';
import { ConfigContext, ConfigContextType } from '@/contexts/config-context';
import { DatabaseContext } from './db-context';
import { toast } from 'sonner';


export type FolderContextType = {
    folders: Folder[];
    currentFolder: Folder | null; 
    addingNewFolder: boolean;
    setAddingNewFolder: (adding: boolean) => void;
    folderEditOpen: boolean;
    setFolderEditOpen: (editMode: boolean) => void;
    folderListPopup: boolean;
    setFolderListPopup: (open: boolean) => void;
    updateFolder: (folder: Folder) => Promise<Folder>;
    deleteFolder: (record: Folder) => Promise<boolean>;
    listFolders: () => Promise<Folder[]>;
    setCurrentFolder: (folder: Folder | null) => void; // new method
    loaderStatus: DataLoadingStatus;
}

export const FolderContext = createContext<FolderContextType | null>(null);

export const FolderContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loaderStatus, setLoaderStatus] = useState<DataLoadingStatus>(DataLoadingStatus.Idle);
    const [folderListPopup, setFolderListPopup] = useState<boolean>(false);
    const [folderEditOpen, setFolderEditOpen] = useState<boolean>(false);
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null); // new state
    const [addingNewFolder, setAddingNewFolder] = useState<boolean>(false);
    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext);

    useEffect(() => {
        listFolders();
    },[]);
    const setupApiClient = async (config: ConfigContextType | null) => {
        const masterKey = dbContext?.masterKey
        const encryptionConfig: ApiEncryptionConfig = {
            secretKey: masterKey,
            useEncryption: true
        };
        const client = new FolderApiClient('', dbContext, encryptionConfig);
        return client;
    }    

    const updateFolder = async (folder: Folder): Promise<Folder> => {
        try {
            const client = await setupApiClient(config);
            const folderDTO = folder.toDTO(); // DTOs are common ground between client and server
            const response = await client.put(folderDTO);
            const newRecord = typeof folder?.id  === 'undefined'
            if (response.status !== 200) {
                console.error('Error adding folder:', response.message);
                toast.error('Error adding folder');

                return folder;
            } else {
                const updatedFolder = Object.assign(folder, { id: response.data.id });
                setFolders(
                    newRecord ? [...folders, updatedFolder] :
                    folders.map(pr => pr.id === folder.id ?  folder : pr)
                )
                return updatedFolder;
            }
        } catch (error) {
            console.error('Error adding folder record:', error);
            toast.error('Error adding folder record');
            return folder;
        }
    };

    const deleteFolder = async (record: Folder): Promise <boolean> => {
        const apiClient = await setupApiClient(config);
        const result = await apiClient.delete(record.toDTO())
        if(result.status !== 200) {
            toast.error('Error removing folder: ' + result.message)
            return Promise.resolve(false);
        } else {
            toast.success('Folder removed successfully!')
            const updatedFolders = folders.filter((pr) => pr.id !== record.id);
            setFolders(updatedFolders);            
            return Promise.resolve(true);
        }
    }

    const listFolders = async ():Promise<Folder[]>  => {
        const client = await setupApiClient(config);
        setLoaderStatus(DataLoadingStatus.Loading);
        try {
            const apiResponse = await client.get();
            const fetchedFolders = apiResponse.map((folderDTO: FolderDTO) => Folder.fromDTO(folderDTO));
            setFolders(fetchedFolders);
            setLoaderStatus(DataLoadingStatus.Success);
            setCurrentFolder(fetchedFolders.length > 0 ? fetchedFolders[0] : null)
            return fetchedFolders;
        } catch(error) {
            setLoaderStatus(DataLoadingStatus.Error);
            throw (error)
        };
    };

    return (
        <FolderContext.Provider
            value={{ addingNewFolder, setAddingNewFolder, folders, folderListPopup, setFolderListPopup, folderEditOpen, setFolderEditOpen, updateFolder, deleteFolder, listFolders, loaderStatus, setCurrentFolder, currentFolder }}
        >
            {children}
        </FolderContext.Provider>
    );
};

