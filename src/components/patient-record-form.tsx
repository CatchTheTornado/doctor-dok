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
import { use, useContext, useState } from "react";
import { Patient, PatientRecord } from "@/data/client/models";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { PatientContext } from "@/contexts/patient-context";
import { PatientRecordContext } from "@/contexts/patient-record-context";
import { getCurrentTS } from "@/lib/utils";
import { toast } from "sonner";


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

export default function NewPatientRecord({ patient }: { patient: Patient }) {
  const [files, setFiles] = useState<UploadedFile[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const patientContext = useContext(PatientContext);
  const patientRecordContext = useContext(PatientRecordContext);
 
  const dropZoneConfig = {
    maxFiles: 10,
    maxSize: 1024 * 1024 * 50,
    multiple: true,
  };

  const { handleSubmit, register, setError, getValues, formState: { errors,  } } = useForm({
    defaultValues: {
      note: "",
      noteType: "visit"
    }
});  
  
  const onSubmit = (data: any) => {
    // Handle form submission
    if (patientContext?.currentPatient && patientContext?.currentPatient?.id) {
      patientRecordContext?.addPatientRecord(new PatientRecord({
        patientId: patientContext?.currentPatient?.id as number,
        type: data.noteType,
        description: data.note,
        updatedAt: getCurrentTS(),
        createdAt: getCurrentTS()
      })); // TODO: add attachments processing
    } else {
      toast.error("Please select a patient first");
    }
  };

  return (
    <Credenza open={dialogOpen} onOpenChange={setDialogOpen}>
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
                        <span>{file.file.name} - {file.status}</span>
                      </FileUploaderItem>
                    ))}
                </FileUploaderContent>
              </EncryptedAttachmentUploader>        
              </div>
              <div className="pt-5 flex items-right">
              <Select {...register("noteType", { required: true })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="memo">Memo</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="results">Results</SelectItem>
                </SelectContent>
              </Select>
              {errors.noteType && <span className="text-red-500">Note Type is required</span>}
              <Button className="ml-5">Save</Button>
            </div>
          </form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

