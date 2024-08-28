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
import { PlusIcon, TagIcon } from "lucide-react";
import { Button } from "./ui/button";
import { record } from "zod";

export default function RecordList({ folder }) {
  const recordContext = useContext(RecordContext);
  const folderContext = useContext(FolderContext);
  const [sortBy, setSortBy] = useState([ { desc: a => a.createdAt } ]);
  const [displayAttachmentPreviews, setDisplayAttachmentPreviews] = useState(false);
  const config = useContext(ConfigContext);

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
    <div className="bg-white dark:bg-zinc-900 md:p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        { (recordContext?.loaderStatus === "loading") ? (
          <div className="flex justify-center">
            <DataLoader />
          </div>
        ) : (null) }
        { (recordContext?.loaderStatus === "error") ? (
          <Alert status="error">
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
        { (recordContext?.loaderStatus === "success" && recordContext?.records.length > 0) ? (
          <div className="space-y-4">
            {recordContext?.filterAvailableTags && recordContext?.filterAvailableTags.length > 0 ? (
              <div className="p-2 flex flex-wrap items-center gap-1 w-full ">
              {recordContext.filterAvailableTags.sort((a,b) => b.freq - a.freq).slice(0, recordContext.filterAvailableTags.length > 10 ? 10 : recordContext.filterAvailableTags.length).map((tag, index) => (
                <div key={index} className="text-sm inline-flex w-auto"><Button variant={recordContext.filterSelectedTags.includes(tag.tag) ? 'default' : 'secondary' } onClick={() => { 
                  if (folderContext?.currentFolder) {
                    recordContext?.filterToggleTag(tag.tag);
                  }
                }
                }><TagIcon className="w-4 h-4 mr-2" /> {tag.tag +' (' + tag.freq + ')'}</Button></div>
              ))}
            </div>      
            ) : ''}      

            {sort(recordContext?.records).by(sortBy).map((record, index) => (
              <RecordItem key={index} record={record} displayAttachmentPreviews={displayAttachmentPreviews} />
            ))}
          </div>
        ) : (null) }
      </div>
    </div>
  );
}