import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";
import { PatientRecord } from "@/data/client/models";
import { useContext, useEffect, useState } from "react";
import { PencilIcon, Wand2Icon } from "lucide-react";
import { PatientRecordContext } from "@/contexts/patient-record-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { MessageCircleIcon } from '@/components/chat'
import Markdown from "react-markdown";
import { Attachment } from 'ai/react';
import PatientRecordItemJson from "./patient-record-item-json";
import { prompts } from "@/data/ai/prompts";
import remarkGfm from 'remark-gfm'
import { Accordion, AccordionTrigger, AccordionContent, AccordionItem } from "./ui/accordion";
import styles from './patient-record-item.module.css'
import ZoomableImage from './zoomable-image';
import { labels } from '@/data/ai/labels';
import PatientRecordItemExtra from './patient-record-item-extra';
import DataLoader from './data-loader';
import PatientRecordItemCommands from "./patient-record-item-commands";
import { PatientContext } from "@/contexts/patient-context";


export default function PatientRecordItem({ record, displayAttachmentPreviews }: { record: PatientRecord, displayAttachmentPreviews: boolean }) {
  // TODO: refactor and extract business logic to a separate files
  const patientRecordContext = useContext(PatientRecordContext)
  const patientContext = useContext(PatientContext)
  const [parseInProgress, setParseInProgress] = useState(false);
  const [displayableAttachmentsInProgress, setDisplayableAttachmentsInProgress] = useState(false)
  const [commandsOpen, setCommandsOpen] = useState(false);

  const [displayableAttachments, setDisplayableAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (displayAttachmentPreviews && !displayableAttachmentsInProgress) {
      setDisplayableAttachmentsInProgress(true);
      patientRecordContext?.convertAttachmentsToImages(record, false).then((attachments) => {
        setDisplayableAttachments(attachments);
        setDisplayableAttachmentsInProgress(false);
      }).catch((error) => {
        setDisplayableAttachmentsInProgress(false);
      });
    }
  }, [displayAttachmentPreviews, record]);


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
          <div key={index} className="text-sm inline-flex w-auto"><Button variant="outline" onClick={() => patientRecordContext?.downloadAttachment(attachment.toDTO())}><PaperclipIcon className="w-4 h-4 mr-2" /> {attachment.displayName}</Button></div>
        ))}
      </div>
      {displayAttachmentPreviews && record.attachments.length > 0 ? (
        displayableAttachments.length > 0 ? (
          <div className="mt-2 flex-wrap flex items-center justify-left min-h-100">
            {displayableAttachments.map((attachment, index) => (
              <ZoomableImage
                className='w-100 pr-2 pb-2'
                width={100}
                height={100}
                key={`attachment-prv-${index}`}
                src={attachment.url}
                alt={attachment.name}
              />
            ))}
          </div>
        ): (displayableAttachmentsInProgress ? (<div className="mt-2 text-sm text-muted-foreground flex h-4 content-center gap-2">
            <div role="status" className="w-4">
                <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
            </div>          
            Loading previews ...
          </div>): null)
      ) : null}
      <div className="mt-2 flex items-center gap-2">
        <Button size="icon" variant="ghost" title="Edit record">
          <PencilIcon className="w-4 h-4" onClick={() => { patientRecordContext?.setCurrentPatientRecord(record);  patientRecordContext?.setPatientRecordEditMode(true); }} />
        </Button>        
        <Button size="icon" variant="ghost" title="Add attachments">
          <PaperclipIcon className="w-4 h-4"  onClick={() => { patientRecordContext?.setCurrentPatientRecord(record);  patientRecordContext?.setPatientRecordEditMode(true); }} />
        </Button>
        <Button size="icon" variant="ghost" title="Convert to structural data">
          {(parseInProgress) ? (
            <DataLoader />
          ) : (
            <RefreshCwIcon className="w-4 h-4"  onClick={async () => { setParseInProgress(true);  await patientRecordContext?.sendHealthReacordToChat(record, true); setParseInProgress (false); } /* TODO: add prompt UI for altering the prompt */ } />
          )}
        </Button>       
        {(record.json) ? (
        <Button size="icon" variant="ghost" title="Insert into AI Chat">
            <MessageCircleIcon className="w-4 h-4"  onClick={async () => {  patientRecordContext?.sendHealthReacordToChat(record, false);  }} />
        </Button>        
        ) : (          
          null
        )}
        {(record.json) ? (
          <Button size="icon" variant="ghost" title="AI features">
            <Wand2Icon className="w-4 h-4"  onClick={() => { setCommandsOpen(true) }} />
              <PatientRecordItemCommands record={record} patient={patientContext?.currentPatient} open={commandsOpen} setOpen={setCommandsOpen} />
          </Button>                
        ): (null) }
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
              <AlertDialogAction onClick={(e) => patientRecordContext?.deletePatientRecord(record)}>YES</AlertDialogAction>
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
