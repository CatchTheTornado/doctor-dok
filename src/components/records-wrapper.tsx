import { useContext, useEffect } from "react";
import RecordForm from "./record-form";
import RecordList from "./record-list";
import { FolderContext } from "@/contexts/folder-context";
import DatabaseLinkAlert from "./shared/database-link-alert";
import { ConfigContext } from "@/contexts/config-context";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { FoldersIcon, ListIcon, TagIcon, UsersIcon } from "lucide-react";
import { useEffectOnce } from "react-use";
import { RecordContext } from "@/contexts/record-context";
import { DatabaseContext } from "@/contexts/db-context";
import { DatabaseAuthStatus } from "@/data/client/models";
import { Button } from "./ui/button";
import { useDocumentVisibility } from "@/hooks/use-document-visibility";

export default function RecordsWrapper({}) {
  const folderContext = useContext(FolderContext);
  const configContext = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext)
  const recordContext = useContext(RecordContext);
  const documentVisible = useDocumentVisibility();

  useEffect(() => {
    if(recordContext && folderContext && folderContext.currentFolder) {
      //if (documentVisible) {
        recordContext?.listRecords(folderContext?.currentFolder);
      //}
    };
  }, [folderContext?.currentFolder[], folderContext/*, documentVisible*/]);
    
  return (
    <div className="grid min-h-screen w-full bg-zinc-100 dark:bg-zinc-950">
      <div className="md:p-4 xs:p-0">
        { (folderContext?.currentFolder !== null) ? (
          <div>
            <div className="flex-1 overflow-auto">
              <div className="grid gap-4">
                { (dbContext?.authStatus === DatabaseAuthStatus.Authorized && folderContext?.currentFolder) ? (
                  <RecordList key={0} folder={folderContext?.currentFolder} />
                ) : (
                  <DatabaseLinkAlert />
                ) }
              </div>
            </div>
          </div>
        ) : (
        <NoRecordsAlert title="No folders found">
          <div className="flex items-center">Please do select current folder using the <FoldersIcon className="flex ml-4 mr-4" /> icon above.</div>
        </NoRecordsAlert>          
        ) }
      </div>
    </div>
  )
}