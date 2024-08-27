import { useContext, useState } from "react";
import FolderItem from "./folder-item";
import { FolderContext } from "@/contexts/folder-context";
import { DatabaseAuthStatus, DataLoadingStatus } from "@/data/client/models";
import DataLoader from "./data-loader";
import { ConfigContext } from "@/contexts/config-context";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { FoldersIcon, FoldersIcon, ListIcon, PlusIcon, Terminal, User2Icon, Users, UserX2Icon } from "lucide-react";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { Button } from "./ui/button";
import DatabaseLinkAlert from "./shared/database-link-alert";
import { FolderEditPopup } from "./folder-edit-popup";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { DatabaseContext } from "@/contexts/db-context";

export default function FolderListPopup() {
  const dbContext = useContext(DatabaseContext);
  const foldersContext = useContext(FolderContext)

  return (
    <Credenza open={foldersContext?.folderListPopup} onOpenChange={foldersContext?.setFolderListPopup}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <FoldersIcon className="w-6 h-6" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950" side="top">
        <CredenzaHeader>
          <CredenzaTitle>List folders
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized) ? (
              <FolderEditPopup />
            ) : (null)}
          </CredenzaTitle>
          <CredenzaDescription>
            Select folder to work on
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="h-auto overflow-auto">
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized) ? (
              <div className="p-4 space-y-4">
                {foldersContext?.loaderStatus === DataLoadingStatus.Loading ? (
                  <div className="flex justify-center">
                    <DataLoader />
                  </div>
                ) : (
                  (foldersContext?.folders.length > 0) ?
                    foldersContext?.folders.map((folder, index) => (
                      <FolderItem key={index} folder={folder} selected={foldersContext?.currentFolder?.id === folder.id} />
                    ))
                    : (
                      <NoRecordsAlert title="No folders found">
                        No folders found in the database. Please add a new folder using <strong>+</strong> icon above.
                      </NoRecordsAlert>
                    )
                )}
              </div>
            ) : (
              <DatabaseLinkAlert />
            )}
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}