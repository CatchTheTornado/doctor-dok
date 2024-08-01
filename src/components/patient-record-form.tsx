"use client"
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "./icons";
import {
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
  UploadedFile,
  EncryptedAttachmentUploader,
} from "@/components/encrypted-attachment-uploader";
import { use, useContext, useEffect, useState } from "react";
import { EncryptedAttachment, Patient, PatientRecord } from "@/data/client/models";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { PlusIcon } from "lucide-react";
import { useForm, useFormContext } from "react-hook-form";
import { PatientContext } from "@/contexts/patient-context";
import { PatientRecordContext } from "@/contexts/patient-record-context";
import { getCurrentTS } from "@/lib/utils";
import { toast } from "sonner";
import { EncryptedAttachmentDTO } from "@/data/dto";
import { EncryptedAttachmentApiClient } from "@/data/client/encrypted-attachment-api-client";
import { ConfigContext } from "@/contexts/config-context";
import { set } from "zod";
import DataLoader from "./data-loader";
import { DatabaseContext } from "@/contexts/db-context";


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

export default function PatientRecordForm({ patient }: { patient?: Patient }) {
  const patientContext = useContext(PatientContext);
  const configContext = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext);
  const patientRecordContext = useContext(PatientRecordContext);
  const [files, setFiles] = useState<UploadedFile[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setValue("note", patientRecordContext?.currentPatientRecord?.description as string);
    let existingFiles:UploadedFile[] = []
    if (patientRecordContext?.currentPatientRecord) {
      existingFiles = patientRecordContext?.currentPatientRecord?.attachments.map((attachment) => {
        return {
          id: attachment.id, 
          status: "uploaded",
          uploaded: true,
          index: attachment.id,
          file: new File([], attachment.displayName),
          dto: attachment
        }
      }) as UploadedFile[];
    }
    setFiles(existingFiles);    
  }, [patientRecordContext?.currentPatientRecord]);
  
  const onSubmit = async (data: any) => {
    // Handle form submission
    if (patientContext?.currentPatient && patientContext?.currentPatient?.id) {

      let isStillUploading = false;
      const uploadedAttachments: EncryptedAttachment[] = [];
      if (files) {
        files.forEach((file) => {
          if (file.dto) { // file is uploaded successfully
            uploadedAttachments.push(new EncryptedAttachment(file.dto));
          } else {
            isStillUploading = true;
          }

          if (file.status === 'error') {
            toast('Please check upload error for file ' + file.dto?.displayName);
          }
        });
      }
      if(isStillUploading) {
        toast('Please wait until all files are uploaded');
        return;
      }
      let pr: PatientRecord;
      if (patientRecordContext?.currentPatientRecord && patientRecordContext?.patientRecordEditMode) { // edit mode
        pr = new PatientRecord(patientRecordContext?.currentPatientRecord);
        pr.description = data.note;
        pr.attachments = uploadedAttachments;
        pr.updatedAt = getCurrentTS();
      } else {  // add mode
        pr = new PatientRecord({
          patientId: patientContext?.currentPatient?.id as number,
          type: 'note',
          description: data.note,
          updatedAt: getCurrentTS(),
          createdAt: getCurrentTS(),
          attachments: uploadedAttachments
        } as PatientRecord)
      }

      const savedPatientRecord = await patientRecordContext?.updatePatientRecord(pr); // TODO: add attachments processing

      if(savedPatientRecord?.id) // if patient record is saved successfully
      {
         const eaac = new EncryptedAttachmentApiClient('', {
          secretKey: dbContext,
          useEncryption: true
        });
        uploadedAttachments?.forEach(async (attachmentToUpdate) => {
          attachmentToUpdate.assignedTo = [{ id: savedPatientRecord.id as number, type: "patient_record" }, { id: patientContext?.currentPatient?.id as number, type: "patient" }];
          await eaac.put(attachmentToUpdate.toDTO());
        }); 
        setFiles([]); // clear form
        reset(); 
        toast.success("Patient record saved successfully");
        setDialogOpen(false);
        patientRecordContext?.setPatientRecordEditMode(false);
      }
    } else {
      toast.error("Please select a patient first");
    }
  };

  return (
    <Credenza open={dialogOpen || patientRecordContext?.patientRecordEditMode} onOpenChange={(value) => { setDialogOpen(value); if(!value) patientRecordContext?.setPatientRecordEditMode(false); }}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusIcon className="w-6 h-6" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[600px] bg-white dark:bg-zinc-950">
        <CredenzaHeader>
          <CredenzaTitle>{patient?.displayName()}</CredenzaTitle>
          <CredenzaDescription>
            Birth date: {patient?.displatDateOfBirth()}
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="mb-6 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-4 resize-x">
              <Textarea
                className="block w-full resize-none border-none focus:ring-0 h-auto"
                placeholder="Add a new note..."
                rows={5}
                {...register("note", { required: true })}
              />
            </div>
            {errors.note && <div className="text-red-500 text-sm">Note is required</div>}
            <div className="flex w-full pv-5">
              <EncryptedAttachmentUploader
                value={files}
                onValueChange={setFiles}
                onUploadSuccess={() => { setDialogOpen(true)}}
                onUploadError={() => { setDialogOpen(true)}}
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
                        <div className="flex">{file.file.name} - {file.status}{file.status !== 'uploaded' && file.status !== 'success'  ? ( <div className="ml-2 h-4 w-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />) : null}</div>
                      </FileUploaderItem>
                    ))}
                </FileUploaderContent>
              </EncryptedAttachmentUploader>        
              </div>
              <div className="pt-5 flex items-right">
              <Button>Save</Button>
            </div>
          </form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

