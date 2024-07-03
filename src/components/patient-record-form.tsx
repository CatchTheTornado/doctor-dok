"use client"
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "./icons";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
  UploadedFile,
} from "@/components/extension/file-uploader";
import { useState } from "react";
import { Patient } from "@/data/client/models";

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
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
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        PNG, JPG, PDF or GIF
      </p>
    </>
  );
};

export default function NewPatientRecord({ patient }: { patient: Patient }) {
  const [files, setFiles] = useState<UploadedFile[] | null>(null);
 
  const dropZoneConfig = {
    maxFiles: 10,
    maxSize: 1024 * 1024 * 50,
    multiple: true,
  };
  
  return (
    <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4 pr-2">
        <div className="text-lg font-medium">{patient?.displayName()}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last visit: {patient?.displatDateOfBirth()}</div>
      </div>      
      <div className="flex items-center gap-4 resize-x">
        <Textarea
          className="flex-1 resize-none border-none focus:ring-0 h-auto"
          placeholder="Add a new note..."
          rows={5}
        />
        </div>
        <div className="flex w-full pv-5">
        <FileUploader
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
        </FileUploader>        
        </div>
        <div className="pt-5 flex items-right">
        <Select>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Note type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="memo">Memo</SelectItem>
            <SelectItem value="visit">Visit</SelectItem>
            <SelectItem value="results">Results</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-5">Save</Button>
      </div>      
    </div>

  );
}
