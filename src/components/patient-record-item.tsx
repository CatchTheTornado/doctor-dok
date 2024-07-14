import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";
import { PatientRecord } from "@/data/client/models";
import { EncryptedAttachmentApiClient } from "@/data/client/encrypted-attachment-api-client";
import { ConfigContext } from "@/contexts/config-context";
import { useContext } from "react";
import { PencilIcon } from "lucide-react";
import { PatientRecordContext } from "@/contexts/patient-record-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PatientRecordApiClient } from "@/data/client/patient-record-api-client";

export default function PatientRecordItem(record: PatientRecord) {

  const config = useContext(ConfigContext);
  const patientRecordContext = useContext(PatientRecordContext)

  const getAttachmentApiClient = async () => {
    const secretKey = await config?.getServerConfig('dataEncryptionMasterKey') as string;
    const apiClient = new EncryptedAttachmentApiClient('', {
      secretKey: secretKey,
      useEncryption: secretKey ? true : false
    })
    return apiClient;
  }

  const getPatientRecordApiClient = async () => {
    const secretKey = await config?.getServerConfig('dataEncryptionMasterKey') as string;
    const apiClient = new PatientRecordApiClient('', {
      secretKey: secretKey,
      useEncryption: secretKey ? true : false
    })
    return apiClient;
  }  

  const downloadAttachment = async (attachment: any) => {
    console.log('Download attachment', attachment);

    const client = await getAttachmentApiClient();
    const arrayBufferData = await client.get(attachment);    

    const blob = new Blob([arrayBufferData], { type: attachment.mimeType + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url);    
  };

  const deleteHealthRecord = async (record: PatientRecord) => { // TODO: move it to patient record context
    await patientRecordContext?.deletePatientRecord(record);
  }


  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{record.type}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{record.createdAt}</div>
      </div>
      <div className="mt-2 text-sm">{record.description}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2 w-100">
        {record.attachments.map((attachment, index) => (
          <div key={index} className="text-sm inline-flex w-auto"><Button variant="outline" onClick={() => downloadAttachment(attachment)}><PaperclipIcon className="w-4 h-4 mr-2" /> {attachment.displayName}</Button></div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
      <Button size="icon" variant="ghost">
          <PencilIcon className="w-4 h-4" onClick={() => { patientRecordContext?.setCurrentPatientRecord(record);  patientRecordContext?.setPatientRecordEditMode(true); }} />
        </Button>        
        <Button size="icon" variant="ghost">
          <PaperclipIcon className="w-4 h-4"  onClick={() => { patientRecordContext?.setCurrentPatientRecord(record);  patientRecordContext?.setPatientRecordEditMode(true); }} />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button size="icon" variant="ghost">
              <Trash2Icon className="w-4 h-4" />
            </Button>            
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-zinc-950">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your health data record
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => deleteHealthRecord(record)}>YES</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>               
      </div>
    </div>
  );
}