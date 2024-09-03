"use client"
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "./icons";
import { Tag, TagInput } from 'emblor';
import {
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
  UploadedFile,
  EncryptedAttachmentUploader,
  FileUploadStatus,
} from "@/components/encrypted-attachment-uploader";
import { SetStateAction, use, useCallback, useContext, useEffect, useState } from "react";
import { EncryptedAttachment, Folder, Record } from "@/data/client/models";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { PlusIcon } from "lucide-react";
import { useForm, useFormContext } from "react-hook-form";
import { FolderContext } from "@/contexts/folder-context";
import { RecordContext } from "@/contexts/record-context";
import { getCurrentTS } from "@/lib/utils";
import { toast } from "sonner";
import { EncryptedAttachmentApiClient } from "@/data/client/encrypted-attachment-api-client";
import { ConfigContext } from "@/contexts/config-context";
import { DatabaseContext } from "@/contexts/db-context";
import { MicIcon } from "lucide-react"; // Add this import statement
import dynamic from "next/dynamic";
import { record } from "zod";

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-zinc-500 dark:text-zinc-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        PNG, JPG, PDF or GIF
      </p>
    </>
  );
};

export enum RecordEditMode {
  Classic = 'classic',
  VoiceRecorder = 'voiceRecorder'
}

const VoiceRecorder = dynamic(() =>
  import('@/components/voice-recorder').then((mod) => mod.default)
)

export default function RecordForm({ folder, mode }: { folder?: Folder, mode?: RecordEditMode }) {
  const folderContext = useContext(FolderContext);
  const configContext = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext);
  const recordContext = useContext(RecordContext);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [transcription, setTranscription] = useState<string>("");
  const [removeFiles, setRemoveFiles] = useState<UploadedFile[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [chatGptApiKey, setChatGptApiKey] = useState<string>('');


  const dropZoneConfig = {
    maxFiles: 10,
    maxSize: 1024 * 1024 * 50,
    multiple: true,
  };

  

    const { handleSubmit, register, reset, setError, getValues, setValue, formState: { errors } } = useForm({
      defaultValues: {
        note: "",
        noteType: "visit"
      }
  });  

  useEffect(() => {
    if (mode === RecordEditMode.VoiceRecorder) {
      const setupRecorder = async () => {
        const chatGptKey = await configContext?.getServerConfig('chatGptApiKey');
        setChatGptApiKey(chatGptKey as string);
      }
      setupRecorder();
    }
    
    if (recordContext?.currentRecord && recordContext?.recordEditMode) {
      setTags(recordContext?.currentRecord?.tags?.map((tag) => {
        return {text: tag, id: tag, label: tag, value: tag}
      }) as Tag[]);
      setTranscription(recordContext?.currentRecord?.transcription as string);
      setValue("note", recordContext?.currentRecord?.description as string);
      let existingFiles:UploadedFile[] = []
      if (recordContext?.currentRecord) {
        let idx = 0
        existingFiles = recordContext?.currentRecord?.attachments.map((attachment) => {
          idx ++;
          return {
            id: attachment.id, 
            status: FileUploadStatus.SUCCESS,
            uploaded: true,
            index: idx,
            file: new File([], attachment.displayName),
            dto: attachment
          }
        }) as UploadedFile[];
      }
      setFiles(existingFiles);    
    }
  }, [recordContext?.currentRecord, recordContext?.recordEditMode, setValue]);
  
  const onSubmit = async (data: any) => {
    // Handle form submission

    if (!data.note && !transcription && files?.length == 0)
    {
      toast.error('Please upload at least one file or enter note text description');
      return;
    }
    if (folderContext?.currentFolder && folderContext?.currentFolder?.id) {

      let isStillUploading = false;
      const uploadedAttachments: EncryptedAttachment[] = [];
      if (files) {
        files.forEach((file) => {
          if (file.dto) { // file is uploaded successfully
            uploadedAttachments.push(new EncryptedAttachment(file.dto));
          } else {
            isStillUploading = true;
          }

        if (file.status === FileUploadStatus.ERROR) {
            toast('Please check upload error for file ' + file.dto?.displayName);
          }
        });
      }
      if(isStillUploading) {
        toast('Please wait until all files are uploaded');
        return;
      }
      let pr: Record;
      const savedRecords:Record[] = []

      const eaac = new EncryptedAttachmentApiClient('', dbContext, {
        secretKey: dbContext?.masterKey,
        useEncryption: true
      });

      const assignAttachments = async (savedRecord: Record) => {
        uploadedAttachments?.forEach(async (attachmentToUpdate) => {
          attachmentToUpdate.assignedTo = [{ id: savedRecord.id as number, type: "record" }, { id: folderContext?.currentFolder?.id as number, type: "folder" }];
          await eaac.put(attachmentToUpdate.toDTO());
        }); 
      }      

      setDialogOpen(false);

      try {
        if (recordContext?.currentRecord && recordContext?.recordEditMode) { // edit mode
          pr = new Record(recordContext?.currentRecord);
          pr.description = data.note;
          pr.transcription = transcription;
          pr.attachments = uploadedAttachments;
          pr.updatedAt = getCurrentTS();
          pr.tags = tags ? tags.map((tag) => tag.text) : [];
          pr.updateChecksum();
          const savedRecord = await recordContext?.updateRecord(pr) as Record;
          savedRecords.push(savedRecord);
          await assignAttachments(savedRecord);
        } else {  // add mode

          if (uploadedAttachments.length == 0 && (data.note !== "" || transcription !== "")) {
            pr = new Record({ // only note no attachments
              folderId: folderContext?.currentFolder?.id as number,
              type: 'note',
              tags: tags ? tags.map((tag) => tag.text) : [],
              description: data.note,
              transcription: transcription,
              updatedAt: getCurrentTS(),
              createdAt: getCurrentTS(),
              eventDate: getCurrentTS()
            } as Record)
            pr.updateChecksum();
            const savedRecord = await recordContext?.updateRecord(pr) as Record;
            savedRecords.push(savedRecord);
          } else {
            for(const uploadedAttachment of uploadedAttachments) {
              pr = new Record({
                folderId: folderContext?.currentFolder?.id as number,
                type: 'note',
                tags: tags ? tags.map((tag) => tag.text) : [],
                description: data.note,
                transcription: transcription,
                updatedAt: getCurrentTS(),
                createdAt: getCurrentTS(),
                eventDate: getCurrentTS(),
                attachments: [uploadedAttachment]
              } as Record)
              pr.updateChecksum();
              const savedRecord = await recordContext?.updateRecord(pr) as Record;
              savedRecords.push(savedRecord);
              await assignAttachments(savedRecord);
            }
          }
        }
      } catch (err) {
        setDialogOpen(true);
        toast.error('Error saving record ' + err);
        console.log(err);
        return;
      }

      if(savedRecords.length > 0) // if  record is saved successfully
      {
        console.log('Clearing removed attachments', removeFiles);
        removeFiles.forEach(async (attachmentToRemove) => {
          if (attachmentToRemove) {
            try {
              if(attachmentToRemove.dto) await eaac.delete(attachmentToRemove.dto); // TODO: in case user last seconds cancels record save AFTER attachment removal it may cause problems that attachments are still attached to the record but not existient on the storage
            } catch (error) {
              toast.error('Error removing file from storage ' + error);
              console.error(error);
            }  
          }
        });
        setRemoveFiles([]); // clear form
        setFiles([]); // clear form
        setTags([]); // clear form
        reset(); 
        toast.success("Record saved successfully");
        recordContext?.setRecordEditMode(false);
      } else {
        toast.error('Error adding records. Please try again later');
        setDialogOpen(false);
      }
    } else {
      toast.error("Please select a folder first");
    }
  };

  return (
    <Credenza open={dialogOpen || recordContext?.recordEditMode} onOpenChange={(value) => { setDialogOpen(value); if(!value) {
      setFiles([]);
      setTags([]);
      setRemoveFiles([]);
      reset();
      recordContext?.setRecordEditMode(false); 
    } }}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          {mode === RecordEditMode.VoiceRecorder ? (<MicIcon className="w-6 h-6" />) : (<PlusIcon className="w-6 h-6" />)}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[600px] bg-white dark:bg-zinc-950">
        <CredenzaHeader>
          <CredenzaTitle>{folder?.displayName()}</CredenzaTitle>
        </CredenzaHeader>
        <div className="mb-6 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            { mode === RecordEditMode.VoiceRecorder && ((recordContext?.recordEditMode && recordContext?.currentRecord?.transcription || !recordContext?.recordEditMode)) ? (<VoiceRecorder prevTranscription={transcription} chatGptKey={chatGptApiKey} onTranscriptionChange={(trs) => {
              setTranscription(trs);
            }} />) : null }
            {recordContext?.currentRecord ? (
              <div>
                <div className="flex items-center gap-4 resize-x">
                  <Textarea
                    className="block w-full resize-none border-none focus:ring-0 h-auto m-2"
                    placeholder="Add a new note..."
                    rows={5}
                    {...register("note", { required: false })}
                  />
                </div>
                <div className="flex items-center gap-4 p-2">
                  <TagInput
                      placeholder="Enter a topic"
                      tags={tags}
                      styleClasses={{
                        tag: {
                          body: 'flex items-center p-2',
                          closeButton: 'text-red-500 hover:text-red-600',
                        },
                      }}
                      className="sm:min-w-[450px] p-2"
                      setTags={(newTags) => {
                        setTags(newTags);
                      } } activeTagIndex={null} setActiveTagIndex={function (value: SetStateAction<number | null>): void {
                      } }                        />
                </div>
              </div>
            ): ''}
            <div className="flex w-full pv-5">
              <EncryptedAttachmentUploader
                value={files}
                onValueChange={setFiles}
                onFileRemove={(file) => {
                  setRemoveFiles([...removeFiles, file]);
                }}
                onUploadSuccess={(file, queue) => {}}
                onUploadError={(file, queue) => {}}
                dropzoneOptions={dropZoneConfig}
                className="relative bg-background rounded-lg p-2 w-full h-max"
              >
                <FileInput className="outline-dashed outline-1 outline-white">
                  <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                    <FileSvgDraw />
                  </div>
                </FileInput>
                <FileUploaderContent>
                  {files &&
                    files.length > 0 &&
                    files.map((file, i) => (
                      <FileUploaderItem key={i} index={i}>
                        <PaperclipIcon className="h-4 w-4 stroke-current" />
                        <div className="flex">{file.file.name.substring(0, 50) + (file.file.name.length > 50 ? '...' : '') } - {file.status}{file.status !== FileUploadStatus.SUCCESS  ? ( <div className="ml-2 h-4 w-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />) : null}</div>
                      </FileUploaderItem>
                    ))}
                </FileUploaderContent>
              </EncryptedAttachmentUploader>        
              </div>
              {recordContext?.currentRecord ? (
                <div className="pt-5 text-xs">
                  Due to AI provider context limits, if the file contains many findings (eg. blood results) - consider uploading max. 1-2 files per record.
                </div>
              ): ''} 
              <div className="pt-5 flex items-right">
              <Button>Save</Button>
            </div>
          </form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

