import '@enhances/with-resolvers';
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
import { prompts } from "@/data/ai/prompts";
import { formatString } from 'typescript-string-operations'
import remarkGfm from 'remark-gfm'
import { Accordion, AccordionTrigger, AccordionContent, AccordionItem } from "./ui/accordion";
import { EncryptedAttachmentDTO } from "@/data/dto";
import styles from './patient-record-item.module.css'
import { DatabaseContext } from "@/contexts/db-context";


export default function PatientRecordItem(record: PatientRecord) {

  const config = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext);
  const patientRecordContext = useContext(PatientRecordContext)
  const chatContext = useContext(ChatContext);

  const getAttachmentApiClient = async () => {
    const secretKey = dbContext?.masterKey;
    const apiClient = new EncryptedAttachmentApiClient('', dbContext, {
      secretKey: secretKey,
      useEncryption: secretKey ? true : false
    })
    return apiClient;
  }

  const getPatientRecordApiClient = async () => {
    const secretKey = dbContext?.masterKey;
    const apiClient = new PatientRecordApiClient('', dbContext, {
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

  const parsePatientRecord = async (record: PatientRecord, parsePromptText:string)=> {
    const attachments = []
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
        content: parsePromptText,
        experimental_attachments: attachments
      },
      onResult: (resultMessage, result) => {
        if(result.text.indexOf('```json') > -1){
          const codeBlocks = findCodeBlocks(result.text.trimEnd().endsWith('```') ? result.text : result.text + '```', false);
          let recordJSON = [];
          let recordMarkdown = ""
          if(codeBlocks.blocks.length > 0) {
            for (const block of codeBlocks.blocks) {
              if (block.syntax === 'json') {
                const jsonObject = JSON.parse(block.code);
                if(Array.isArray(jsonObject)) {
                  for (const record of jsonObject) {
                    recordJSON.push(record);
                  }
                } else recordJSON.push(jsonObject);
              }

              if (block.syntax === 'markdown') {
                recordMarkdown += block.code;
              }
            }

            if (record) {
              const discoveredType = recordJSON.length > 0 ? recordJSON.map(item => item.type).join(", ") : 'note';
              record = new PatientRecord({ ...record, json: recordJSON, text: recordMarkdown, type: discoveredType });
              patientRecordContext?.updatePatientRecord(record);
            }            
            console.log('JSON repr: ', recordJSON);
          }
        }        
      }
    })    
  }

  const sendHealthReacordToChat = async (record: PatientRecord, forceRefresh: boolean = false) => {
    if (!record.json || forceRefresh) {  // first: parse the record
      parsePatientRecord(record, prompts.patientRecordParse({ record, config }));
    } else {
      chatContext.setChatOpen(true);
      chatContext.sendMessage({
        message: {
          role: 'user',
          createdAt: new Date(),
          content: prompts.patientRecordIntoChat({ record, config }),
        }
      });
    }
  }


  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{record.type}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{record.createdAt}</div>
      </div>
      <div className="mt-5 rose text-sm text-muted-foreground"><Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{record.description}</Markdown></div>
      <div className="mt-2 flex flex-wrap items-center gap-2 w-100">
        {record.text ? (
           <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Full text results and findings</AccordionTrigger>
                        <AccordionContent>
                          <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{record.text}</Markdown>                          
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>        
          ): null }
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
          <RefreshCwIcon className="w-4 h-4"  onClick={() => { sendHealthReacordToChat(record, true) } /* TODO: add prompt UI for altering the prompt */ } />
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


function RefreshCwIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}
