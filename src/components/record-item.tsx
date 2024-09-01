import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";
import { DisplayableDataObject, Record } from "@/data/client/models";
import { useContext, useEffect, useRef, useState } from "react";
import { PencilIcon, TagIcon, Wand2Icon, XCircleIcon } from "lucide-react";
import { RecordContext } from "@/contexts/record-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { MessageCircleIcon } from '@/components/chat'
import Markdown from "react-markdown";
import RecordItemJson from "./record-item-json";
import { prompts } from "@/data/ai/prompts";
import remarkGfm from 'remark-gfm'
import { Accordion, AccordionTrigger, AccordionContent, AccordionItem } from "./ui/accordion";
import styles from './record-item.module.css'
import ZoomableImage from './zoomable-image';
import { labels } from '@/data/ai/labels';
import RecordItemExtra from './record-item-extra';
import DataLoader from './data-loader';
import RecordItemCommands from "@/components/record-item-commands";
import { FolderContext } from "@/contexts/folder-context";
import { ChatContext } from "@/contexts/chat-context";
import { ConfigContext } from "@/contexts/config-context";
import { toast } from "sonner";
import { DatabaseContext } from "@/contexts/db-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";


export default function RecordItem({ record, displayAttachmentPreviews }: { record: Record, displayAttachmentPreviews: boolean }) {
  // TODO: refactor and extract business logic to a separate files
  const recordContext = useContext(RecordContext)
  const chatContext = useContext(ChatContext);
  const dbContext = useContext(DatabaseContext);
  const config = useContext(ConfigContext);
  const folderContext = useContext(FolderContext)
  const [displayableAttachmentsInProgress, setDisplayableAttachmentsInProgress] = useState(false)
  const [commandsOpen, setCommandsOpen] = useState(false);
  const thisElementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastlyLoadedCacheKey, setLastlyLoadedCacheKey] = useState('');
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const [displayableAttachments, setDisplayableAttachments] = useState<DisplayableDataObject[]>([]);

  const loadAttachmentPreviews = async () => {
    const currentCacheKey = await record.cacheKey(dbContext?.databaseHashId);
    if (displayAttachmentPreviews && !displayableAttachmentsInProgress && lastlyLoadedCacheKey !== currentCacheKey) {
      setDisplayableAttachmentsInProgress(true);
      try {
        const attachments = await recordContext?.convertAttachmentsToImages(record, false);
        setDisplayableAttachments(attachments as DisplayableDataObject[]);
        setDisplayableAttachmentsInProgress(false);
        setLastlyLoadedCacheKey(currentCacheKey)
      } catch(error) {
        setDisplayableAttachmentsInProgress(false);
      };
    }    
  }

  const shorten = (str: string) => {
    if(str) {
      if(str.length > 16) return str.slice(0, 16 ) + '...'; else return str;
    }
  return str;
  }

  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: '0px', // no margin
        threshold: 0.25, // 50% of target visible
      }
    );

    if (thisElementRef.current) {
      observer.observe(thisElementRef.current);
    }

    // Clean up the observer
/*    return () => {
      if (thisElementRef.current) {
        observer.unobserve(thisElementRef.current);
      }
    };*/
  }, [])

  useEffect(() => {

    if (isVisible) {      
      loadAttachmentPreviews();
    }

    if (config?.getServerConfig('autoParseRecord') && (record.checksum !== record.checksumLastParsed) && !record.parseInProgress && !record.parseError && (new Date().getTime() - new Date(record.updatedAt).getTime()) < 1000 * 60 * 60 /* parse only records changed up to 1 h */) { // TODO: maybe we need to add "parsedDate" or kind of checksum (better!) to make sure the record is parseed only when something changed
      console.log('Adding to parse queue due to checksum mismatch ', record.id, record.checksum, record.checksumLastParsed);
      setTimeout(() => {
        recordContext?.parseRecord(record);
      }, 1000);
    }

    recordContext?.processParseQueue();
  }, [displayAttachmentPreviews, record, isVisible]);


  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 md:p-4 xs:p-2 md:rounded-md mb-4 xs:mb-2">
      <div className="flex items-center justify-between mb-4">
        {record.title ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{record.title}</div>
        ) : (
          (record.json) ? (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{record.id}: {labels.recordItemLabel(record.type, { record })}</div>
          ) : (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{record.parseInProgress ? 'Parsing record in progres...' : 'Record uploaded, no additional data.' }</div>
          ) 
        )}
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{record.createdAt}</div>
      </div>
      <Tabs defaultValue="text" className="w-full text-sm">
        {(record.json || record.extra) ? (
          <TabsList className="grid grid-cols-2 gap-2">
            <TabsTrigger value="text" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100 rounded-md p-2">Basic view</TabsTrigger>
            <TabsTrigger value="json" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100 rounded-md p-2">Detailed view</TabsTrigger>
          </TabsList>
        ): ''}
          <TabsContent value="text" className="max-w-600">
            {record.description ? (
              <div className="mt-5 rose text-sm text-muted-foreground"><Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{record.description}</Markdown></div>
            ): '' }
            <div className="mt-2 flex flex-wrap items-center gap-2 w-100">
            {record.text ? (
              <div className="w-full cursor-pointer" onClick={(e) => setIsTextExpanded(!isTextExpanded)}>
                  <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>{isTextExpanded ? record.text : record.text?.slice(0, 256)}</Markdown>{!isTextExpanded ? (<DotsHorizontalIcon />):''}                          
                </div>        
              ): null }
              {record.tags && record.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 w-full">
                {record.tags.map((tag, index) => (
                  <div key={index} className="text-sm inline-flex w-auto"><Button variant={recordContext?.filterSelectedTags.includes(tag) ? 'default' : 'outline' }  onClick={() => {
                    if (folderContext?.currentFolder) {
                      recordContext?.filterToggleTag(tag);
                    }      
                  }
                 }><TagIcon className="w-4 h-4 mr-2" /> {shorten(tag)}{recordContext?.filterSelectedTags.includes(tag)? (<XCircleIcon className="w-4 h-4 ml-2" />) : null }</Button></div>
                ))}
              </div>
              ): '' }

              <div className="mt-2 flex flex-wrap items-center gap-2 w-full">
                {record.attachments.map((attachment, index) => (
                  <div key={index} className="text-sm inline-flex w-auto"><Button variant="outline" onClick={() => recordContext?.downloadAttachment(attachment.toDTO(), false)}><PaperclipIcon className="w-4 h-4 mr-2" /> {shorten(attachment.displayName)}</Button></div>
                ))}
              </div>
              {displayAttachmentPreviews && record.attachments.length > 0 ? (
                displayableAttachments.length > 0 ? (
                  <div className="mt-2 flex-wrap flex items-center justify-left min-h-100 w-full">
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
              </div>
          </TabsContent>
          <TabsContent value="json" className="max-w-600">
            <div className="mt-2 flex flex-wrap items-center gap-2 w-100">
              <RecordItemJson record={record} />
              <RecordItemExtra record={record} />
            </div>
          </TabsContent>

      </Tabs>


      <div ref={thisElementRef} className="mt-2 flex items-center gap-2">
        <Button size="icon" variant="ghost" title="Edit record">
          <PencilIcon className="w-4 h-4" onClick={() => { if(record.parseInProgress) { toast.info('Please wait until record is successfully parsed') } else {  recordContext?.setCurrentRecord(record);  recordContext?.setRecordEditMode(true); } }} />
        </Button>        
        <Button size="icon" variant="ghost" title="Add attachments">
          <PaperclipIcon className="w-4 h-4"  onClick={() => { if(record.parseInProgress) { toast.info('Please wait until record is successfully parsed') } else {   recordContext?.setCurrentRecord(record);  recordContext?.setRecordEditMode(true);}  }} />
        </Button>
        {(record.attachments && record.attachments.length > 0) ? (
        <Button size="icon" variant="ghost" title="Convert to structural data">
          {(record.parseInProgress) ? (
            <div className="cursor-pointer" onClick={(e) => chatContext.setChatOpen(true) }><DataLoader /></div>
          ) : (
            <RefreshCwIcon className="w-4 h-4"  onClick={async () => {  await recordContext?.sendRecordToChat(record, true); } /* TODO: add prompt UI for altering the prompt */ } />
          )}
        </Button>       
        ) : '' }  
        {(record.json && !record.parseInProgress) ? (
        <Button size="icon" variant="ghost" title="Insert into AI Chat">
            <MessageCircleIcon className="w-4 h-4"  onClick={async () => {  recordContext?.sendRecordToChat(record, false);  }} />
        </Button>        
        ) : (          
          null
        )}
        {(record.json) ? (
          <Button size="icon" variant="ghost" title="AI features">
            <Wand2Icon className="w-4 h-4"  onClick={() => { setCommandsOpen(true) }} />
              <RecordItemCommands record={record} folder={folderContext?.currentFolder} open={commandsOpen} setOpen={setCommandsOpen} />
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
                This action cannot be undone. This will permanently delete your data record
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => recordContext?.deleteRecord(record)}>YES</AlertDialogAction>
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
