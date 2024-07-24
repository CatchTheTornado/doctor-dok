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
import { MessageCircleIcon } from '@/components/chat'
import Markdown from "react-markdown";
import { ChatContext } from "@/contexts/chat-context";
import { Attachment } from 'ai/react';
import { convertDataContentToBase64String } from "ai";
import { convert } from '@/lib/pdf2js'
import { pdfjs } from 'react-pdf'
import { findCodeBlocks } from "@/lib/utils";
import PatientRecordItemJson from "./patient-record-item-json";

export default function PatientRecordItem(record: PatientRecord) {

  const config = useContext(ConfigContext);
  const patientRecordContext = useContext(PatientRecordContext)
  const chatContext = useContext(ChatContext);

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

  enum URLType {
    data = 'data',
    blob = 'blob'
  }
  const getAttachmentDataURL = async(attachmentDTO: EncryptedAttachmentDTO, type: URLType): string => {
    console.log('Download attachment', attachmentDTO);

    const client = await getAttachmentApiClient();
    const arrayBufferData = await client.get(attachmentDTO);    

    if (type === URLType.blob) {
      const blob = new Blob([arrayBufferData], { type: attachmentDTO.mimeType + ";charset=utf-8" });
      const url = URL.createObjectURL(blob);
      return url;
    } else {
      const url = 'data:' + attachmentDTO.mimeType +';base64,' + convertDataContentToBase64String(arrayBufferData);
      return url;
    }
  }

  const downloadAttachment = async (attachment: any) => {
    const url = await getAttachmentDataURL(attachment, URLType.blob);
    window.open(url);    
  };

  const deleteHealthRecord = async (record: PatientRecord) => { // TODO: move it to patient record context
    await patientRecordContext?.deletePatientRecord(record);
  }

  const sendHealthReacordToChat = async (record: PatientRecord) => {
    const attachments = []
    
    if (!record.json) { 
      for(const ea of record.attachments){

        if (ea.mimeType === 'application/pdf') {
          const pdfBase64Content = await getAttachmentDataURL(ea.toDTO(), URLType.data); // convert to images otherwise it's not supported by vercel ai sdk
          const imagesArray = await convert(pdfBase64Content, { base64: true }, pdfjs)
          for (let i = 0; i < imagesArray.length; i++){
            attachments.push({
              name: ea.displayName + ' page ' + (i+1),
              contentType: 'image/x-png',
              url: imagesArray[i]
            })
          }

        } else {
          attachments.push({
            name: ea.displayName,
            contentType: ea.mimeType,
            url: await getAttachmentDataURL(ea.toDTO(), URLType.data) // TODO: convert PDF attachments to images here
          })
        }
      }

      chatContext.setChatOpen(true);
      chatContext.sendMessage({
        message: {
          role: 'user',
          createdAt: new Date(),
          content: 'This is my health result data. Please parse it to JSON array. JSON should be all in English (translate from original language). Each medical record should a row of returned JSON array, for example: [ { type: "blood_results", subtype: "morphology", ... }, {type: "mri", subtype: "head mri", ...}]. Include the type of this results in english (eg. "blood_results", "rmi") in "type" key of JSON and then more detailed type in "subtype" key. If the result is single block of text please try additionaly to saving text result extract all key features from it and put it as an array under "findings" key. Please describe the results in plain language markdown. This part should be in the language of the document itself. Note all exceptions from the norm and tell me what it could mean?',
          experimental_attachments: attachments
        },
        onResult: (resultMessage, result) => {
          if(result.text.indexOf('```json') > -1){
            const jsonBlocks = findCodeBlocks(result.text);
            let recordJSON = [];
            if(jsonBlocks.blocks.length > 0) {
              for (const jsonBlock of jsonBlocks.blocks) {
                const jsonObject = JSON.parse(jsonBlock.code);
                if(Array.isArray(jsonObject)) {
                  for (const record of jsonObject) {
                    recordJSON.push(record);
                  }
                } else recordJSON.push(jsonObject);
                if (record) {
                  record = new PatientRecord({ ...record, json: recordJSON });
                  patientRecordContext?.updatePatientRecord(record);
                }
              }
              console.log('JSON repr: ', recordJSON);
            }
          }        
        }
      })
    } else {
      chatContext.setChatOpen(true);
      chatContext.sendMessage({
        message: {
          role: 'user',
          createdAt: new Date(),
          content: "This is my health result data in JSON format: ```\n\n" + JSON.stringify(record.json) + "\n\n```. \nJSON Please describe the results in plain language markdown. This part should be in the language of the document itself. Note all exceptions from the norm and tell me what it could mean?",
        }
      });
    }
  }


  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{record.type}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{record.createdAt}</div>
      </div>
      <div className="mt-2 rose text-sm text-muted-foreground [&>*]:p-2 [&_li]:list-disc [&_li]:ml-4"><Markdown>{record.description}</Markdown></div>
      <div className="mt-2 flex flex-wrap items-center gap-2 w-100">
        <PatientRecordItemJson record={record} />
      </div>
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
        <Button size="icon" variant="ghost">
          <MessageCircleIcon className="w-4 h-4"  onClick={() => { sendHealthReacordToChat(record) }} />
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