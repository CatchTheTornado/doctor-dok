import { useContext, useEffect, useState } from "react";
import RecordItem from "./record-item";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { RecordContext } from "@/contexts/record-context";
import { FolderContext } from "@/contexts/folder-context";
import DataLoader from "./data-loader";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { sort } from "fast-sort";
import { useEffectOnce } from "react-use";
import { ConfigContext } from "@/contexts/config-context";
import { PlusIcon, TagIcon, XCircleIcon } from "lucide-react";
import { Button } from "./ui/button";
import { record } from "zod";
import { Folder } from "@/data/client/models";
import RecordsFilter from "./records-filter";

export default function RecordList({ folder }: {folder: Folder}) {
  const recordContext = useContext(RecordContext);
  const folderContext = useContext(FolderContext);
  const [displayAttachmentPreviews, setDisplayAttachmentPreviews] = useState(false);
  const config = useContext(ConfigContext);

  const getSortBy = (sortBy: string) => {
    // Split the string into field and direction
    const [field, direction] = sortBy.split(' ');

    // Determine if it's ascending or descending
    const isDesc = direction.toLowerCase() === 'desc';

    // Return the corresponding object
    if (isDesc) {
        return [{ desc: a => a[field] }];
    } else {
        return [{ asc: a => a[field] }];
    }
  }

  useEffectOnce(() => {
    config?.getServerConfig('displayAttachmentPreviews').then((value) => {
      if (typeof value === "boolean") {
        setDisplayAttachmentPreviews(value as boolean);
      } else {
        setDisplayAttachmentPreviews(true); // default value
      }
    });
  });

  return (
    <div className="bg-white dark:bg-zinc-900 md:p-4 md:rounded-lg shadow-sm">
      <div>
        { (recordContext?.loaderStatus === "error") ? (
          <Alert>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Error while loading folder records. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (null) }
        { (recordContext?.loaderStatus === "success" && recordContext?.records.length === 0) ? (
          <NoRecordsAlert title="No records found">
            No records found in the database. Please add a new folder using <strong>+</strong> icon above.
          </NoRecordsAlert>
        ) : (null) }
            <div className="flex xs:p-2">
               <div className="flex flex-wrap items-center gap-1 w-full ">
                <RecordsFilter />
                  {recordContext?.filterSelectedTags.map((tag, index) => (
                    <div key={index} className="text-sm inline-flex w-auto"><Button className="h-10" variant={recordContext.filterSelectedTags.includes(tag) ? 'default' : 'secondary' } onClick={() => { 
                      if (folderContext?.currentFolder) {
                        recordContext?.filterToggleTag(tag);
                      }
                    }
                    }><TagIcon className="w-4 h-4 mr-2" /> {tag} <XCircleIcon className="w-4 h-4 ml-2" /></Button></div>
                  ))}
                </div>      

                <div className="justify-center w-8 h-8 items-center ml-5">
                { (recordContext?.loaderStatus === "loading") ? (
                  <DataLoader />
                ) : (null) }              
                </div>

            </div>

            {sort(recordContext?.records ?? []).by(getSortBy(recordContext?.sortBy ?? 'createdAt desc')).map((record, index) => (
              <RecordItem key={index} record={record} displayAttachmentPreviews={displayAttachmentPreviews} />
            ))}
          </div>

    </div>
  );
}