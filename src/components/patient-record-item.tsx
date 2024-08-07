import '@enhances/with-resolvers';
import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";
import { PatientRecord } from "@/data/client/models";
import { EncryptedAttachmentApiClient } from "@/data/client/encrypted-attachment-api-client";
import { ConfigContext } from "@/contexts/config-context";
import { useContext, useEffect, useState } from "react";
import { PencilIcon, Wand2Icon } from "lucide-react";
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
import ZoomableImage from './zoomable-image';
import { labels } from '@/data/ai/labels';
import PatientRecordItemExtra from './patient-record-item-extra';
import DataLoader from './data-loader';


export default function PatientRecordItem({ record, displayAttachmentPreviews }: { record: PatientRecord, displayAttachmentPreviews: boolean }) {
  // TODO: refactor and extract business logic to a separate files
  const config = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext);
  const patientRecordContext = useContext(PatientRecordContext)
  const chatContext = useContext(ChatContext);
  let displayableAttachmentsInProgress = false;

  const [displayableAttachments, setDisplayableAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (displayAttachmentPreviews && !displayableAttachmentsInProgress) {
      displayableAttachmentsInProgress = true;
      convertAttachmentsToImages(record).then((attachments) => {
        setDisplayableAttachments(attachments);
        displayableAttachmentsInProgress = false;
      });
    }
  }, [displayAttachmentPreviews, record]);

  const getAttachmentApiClient = async () => {
    const secretKey = dbContext?.masterKey;
    const apiClient = new EncryptedAttachmentApiClient('', dbContext, {
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

  const downloadAttachment = async (attachment: EncryptedAttachmentDTO) => {
    const url = await getAttachmentDataURL(attachment, URLType.blob);
    window.open(url);    
  };

  const deleteHealthRecord = async (record: PatientRecord) => { // TODO: move it to patient record context
    await patientRecordContext?.deletePatientRecord(record);
  }

  const convertAttachmentsToImages = async (record: PatientRecord): Promise<Attachment[]> => {
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
    return attachments
  }

  const extraToRecord = async (type: string, promptText: string, record: PatientRecord) => {

    chatContext.setChatOpen(true);
      chatContext.sendMessage({
        message: {
          role: 'user',
          createdAt: new Date(),
          content: promptText,
        },
        onResult: (resultMessage, result) => {    
          let recordEXTRA = record.extra || []
          recordEXTRA.find(p => p.type === type) ? recordEXTRA = recordEXTRA.map(p => p.type === type ? { ...p, value: result.text } : p) : recordEXTRA.push({ type: type, value: result.text })
          console.log(recordEXTRA);
          record = new PatientRecord({ ...record, extra: recordEXTRA });
          patientRecordContext?.updatePatientRecord(record);          
        }
      })
  }


  const parsePatientRecord = async (record: PatientRecord, parsePromptText:string)=> {
    // TODO: add OSS models and OCR support - #60, #59, #61
    const attachments = await convertAttachmentsToImages(record);

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
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{labels.patientRecordItemLabel(record.type, { record })}</div>
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
        <PatientRecordItemExtra record={record} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 w-100">
        {record.attachments.map((attachment, index) => (
          <div key={index} className="text-sm inline-flex w-auto"><Button variant="outline" onClick={() => downloadAttachment(attachment)}><PaperclipIcon className="w-4 h-4 mr-2" /> {attachment.displayName}</Button></div>
        ))}
      </div>
      {displayAttachmentPreviews && record.attachments.length > 0 ? (
        displayableAttachments.length > 0 ? (
          <div className="mt-2 flex-wrap flex items-center justify-left min-h-100">
            {displayableAttachments.map((attachment, index) => (
              <ZoomableImage
                className='w-100 p-2'
                width={100}
                height={100}
                key={`attachment-prv-${index}`}
                src={attachment.url}
                alt={attachment.name}
              />
            ))}
          </div>
        ): <div className="mt-2 text-sm text-muted-foreground flex h-4 content-center gap-2">
            <div role="status" className="w-4">
                <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
            </div>          
            Loading previews ...
          </div>
      ) : null}
      <div className="mt-2 flex items-center gap-2">
        <Button size="icon" variant="ghost" title="Edit record">
          <PencilIcon className="w-4 h-4" onClick={() => { patientRecordContext?.setCurrentPatientRecord(record);  patientRecordContext?.setPatientRecordEditMode(true); }} />
        </Button>        
        <Button size="icon" variant="ghost" title="Add attachments">
          <PaperclipIcon className="w-4 h-4"  onClick={() => { patientRecordContext?.setCurrentPatientRecord(record);  patientRecordContext?.setPatientRecordEditMode(true); }} />
        </Button>
        <Button size="icon" variant="ghost" title="Convert to structural daya">
          <RefreshCwIcon className="w-4 h-4"  onClick={() => { sendHealthReacordToChat(record, true) } /* TODO: add prompt UI for altering the prompt */ } />
        </Button>       
        <Button size="icon" variant="ghost" title="Insert into AI Chat">
          <MessageCircleIcon className="w-4 h-4"  onClick={() => { sendHealthReacordToChat(record) }} />
        </Button>        
        <Button size="icon" variant="ghost" title="Analyze & Suggest by AI">
          <Wand2Icon className="w-4 h-4"  onClick={() => { extraToRecord('remarks', prompts.patientRecordRemarks({ record }), record) }} />
        </Button>                
        <AlertDialog>
          <AlertDialogTrigger>
            <Button size="icon" variant="ghost" title="Delete record">
              <Trash2Icon className="w-4 h-4"/>
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
