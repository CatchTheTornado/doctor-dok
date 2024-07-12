import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";
import { PatientRecord } from "@/data/client/models";
import { EncryptedAttachmentApiClient } from "@/data/client/encrypted-attachment-api-client";
import { ConfigContext } from "@/contexts/config-context";
import { useContext } from "react";

export default function PatientRecordItem(record: PatientRecord) {

  const config = useContext(ConfigContext);

  const getApiClient = async () => {
    const secretKey = await config?.getServerConfig('dataEncryptionMasterKey') as string;
    const apiClient = new EncryptedAttachmentApiClient('', {
      secretKey: secretKey,
      useEncryption: secretKey ? true : false
    })
    return apiClient;
  }

  const downloadAttachment = async (attachment: any) => {
    console.log('Download attachment', attachment);

    const client = await getApiClient();
    const arrayBufferData = await client.get(attachment);    

    const blob = new Blob([arrayBufferData], { type: attachment.mimeType + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url);    
  };


  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{record.type}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{record.createdAt}</div>
      </div>
      <div className="mt-2 text-sm">{record.description}</div>
      <div className="mt-2 flex items-center gap-2">
        {record.attachments.map((attachment, index) => (
          <div key={index} className="text-sm"><Button variant="outline" onClick={() => downloadAttachment(attachment)}><PaperclipIcon className="w-4 h-4 mr-2" /> {attachment.displayName}</Button></div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <PaperclipIcon className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}