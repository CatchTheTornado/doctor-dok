"use client";

import { Input } from "@/components/ui/input";
import { cn, getCurrentTS } from "@/lib/utils";
import {
  Dispatch,
  SetStateAction,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useDropzone,
  DropzoneState,
  FileRejection,
  DropzoneOptions,
} from "react-dropzone";
import { toast } from "sonner";
import { Trash2 as RemoveIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import axios from "axios";
import { EncryptedAttachmentDTO, EncryptedAttachmentDTOEncSettings } from "@/data/dto";
import { v4 as uuidv4 } from 'uuid';
import { EncryptedAttachmentApiClient } from "@/data/client/encrypted-attachment-api-client";
import { ConfigContext } from "@/contexts/config-context";
import { DTOEncryptionFilter, EncryptionUtils } from "@/lib/crypto";
import { DatabaseContext } from "@/contexts/db-context";
import internal from "stream";
import { SaaSContext } from "@/contexts/saas-context";

type DirectionOptions = "rtl" | "ltr" | undefined;

type FileUploaderContextType = {
  dropzoneState: DropzoneState;
  isLOF: boolean;
  isFileTooBig: boolean;
  removeFileFromSet: (index: number) => void;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  orientation: "horizontal" | "vertical";
  direction: DirectionOptions;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
  const context = useContext(FileUploaderContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploaderProvider");
  }
  return context;
};

export type UploadedFile = {
    id: number | string;
    file: File;
    uploaded: boolean;
    status: FileUploadStatus;
    index: number;
    dto: EncryptedAttachmentDTO | null;
}

export enum FileUploadStatus {
  UPLOADING = 'uploading',
  SUCCESS = 'ok',
  ERROR = 'error',
  ENCRYPTING = 'encrypting'
}

export type UploadQueueStatus = {
  files: UploadedFile[],
  queueSize: number
}

type FileUploaderProps = {
  value: UploadedFile[] | null;
  reSelect?: boolean;
  onFileRemove?: (file: UploadedFile) => void;
  onUploadSuccess?: (value: UploadedFile | null, uploadStatus: UploadQueueStatus) => void;
  onUploadError?: (value: UploadedFile | null, uploadStatus: UploadQueueStatus) => void;
  onAllUploadsComplete?: (value: UploadedFile[] | null) => void;
  onValueChange: (value: UploadedFile[]) => void;
  dropzoneOptions: DropzoneOptions;
  orientation?: "horizontal" | "vertical";
};

export const EncryptedAttachmentUploader = forwardRef<
  HTMLDivElement,
  FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      dropzoneOptions,
      value,
      onValueChange,
      onUploadError,
      onUploadSuccess,
      onFileRemove,
      reSelect,
      orientation = "vertical",
      children,
      dir,
      ...props
    },
    ref
  ) => {
    
    const internalFiles = useRef<UploadedFile[]>([]);

    const [isFileTooBig, setIsFileTooBig] = useState(false);
    const [isLOF, setIsLOF] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [uploadQueueSize, setQueueSize] = useState(0);
    const config = useContext(ConfigContext);
    const dbContext = useContext(DatabaseContext)
    const saasContext = useContext(SaaSContext);
    const {
      accept = {
        "image/*": [".jpg", ".jpeg", ".png", ".pdf"],
      },
      maxFiles = 1,
      maxSize = 4 * 1024 * 1024,
      multiple = true,
    } = dropzoneOptions;

    const reSelectAll = maxFiles === 1 ? true : reSelect;
    const direction: DirectionOptions = dir === "rtl" ? "rtl" : "ltr";

    const updateFile = useCallback((file: UploadedFile, allFiles: UploadedFile[]) => {
      if(value) onValueChange(allFiles.map((f) => (f.index === file.index ? file : f)));
    }, [value, onValueChange]);

    const removeFileFromSet = useCallback(
      async (i: number) => {
        if (!value) return;
        const files = value ? [...value] : [];
        const fileToRemove = files.find((_, index) => index === i);
        const newFiles = files.filter((_, index) => index !== i);
        onValueChange(newFiles);
        if (onFileRemove && fileToRemove) onFileRemove(fileToRemove);          
      },
      [value, onValueChange, onFileRemove]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!value) return;

        const moveNext = () => {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex);
        };

        const movePrev = () => {
          const nextIndex = activeIndex - 1;
          setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex);
        };

        const prevKey =
          orientation === "horizontal"
            ? direction === "ltr"
              ? "ArrowLeft"
              : "ArrowRight"
            : "ArrowUp";

        const nextKey =
          orientation === "horizontal"
            ? direction === "ltr"
              ? "ArrowRight"
              : "ArrowLeft"
            : "ArrowDown";

        if (e.key === nextKey) {
          moveNext();
        } else if (e.key === prevKey) {
          movePrev();
        } else if (e.key === "Enter" || e.key === "Space") {
          if (activeIndex === -1) {
            dropzoneState.inputRef.current?.click();
          }
        } else if (e.key === "Delete" || e.key === "Backspace") {
          if (activeIndex !== -1) {
            removeFileFromSet(activeIndex);
            if (value.length - 1 === 0) {
              setActiveIndex(-1);
              return;
            }
            movePrev();
          }
        } else if (e.key === "Escape") {
          setActiveIndex(-1);
        }
      },
      [value, activeIndex, removeFileFromSet, direction, orientation]
    );
    // TODO: move it to utils as it's pretty much reusable code
    const encryptFile = async (fileObject: File, masterKey?: string): Promise<File> => {
      const encUtils = masterKey ? new EncryptionUtils(masterKey as string) : null;
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = async function() {
          const encryptedBuffer = await encUtils?.encryptArrayBuffer(fr.result as ArrayBuffer) as ArrayBuffer;
          const encryptedFile = new File([encryptedBuffer], fileObject.name, { type: fileObject.type });
          resolve(encryptedFile);
        }
        fr.onerror = reject;
        fr.readAsArrayBuffer(fileObject);
      });
    }
    const onInternalUpload = useCallback(async (fileToUpload:UploadedFile | null, allFiles: UploadedFile[]) => {
        if (fileToUpload){
          fileToUpload.status = FileUploadStatus.UPLOADING;
          updateFile(fileToUpload, allFiles);
          const formData = new FormData();
          const masterKey = await dbContext?.masterKey;
          if(fileToUpload && fileToUpload.file) 
          { 
            const encFilter = masterKey ? new DTOEncryptionFilter(masterKey as string) : null;

            
            let fileObject = masterKey ? await encryptFile(fileToUpload.file, masterKey as string) : fileToUpload.file;
            formData.append("file", fileObject); // TODO: encrypt file here

            let attachmentDTO: EncryptedAttachmentDTO = { // attachment meta data, TODO: if we refactor this to a callback the file uploader could be back re-usable one
              displayName: fileObject.name,
              description: '',
            
              mimeType: fileObject.type,
              size: fileObject.size,
              storageKey: uuidv4(),
            
              createdAt: getCurrentTS(),
              updatedAt: getCurrentTS(),            
            };
            fileToUpload.status = FileUploadStatus.ENCRYPTING;
            updateFile(fileToUpload, allFiles);
            attachmentDTO = encFilter ? await encFilter.encrypt(attachmentDTO, EncryptedAttachmentDTOEncSettings) as EncryptedAttachmentDTO : attachmentDTO;

            formData.append("attachmentDTO", JSON.stringify(attachmentDTO));
            try {
              const apiClient = new EncryptedAttachmentApiClient('', dbContext, saasContext, {
                useEncryption: false  // for FormData we're encrypting records by ourselves - above
              })
              const result = await apiClient.put(formData);
              if (result.status === 200) {
                const decryptedAttachmentDTO: EncryptedAttachmentDTO = (encFilter ? await encFilter.decrypt(result.data, EncryptedAttachmentDTOEncSettings) : result.data) as EncryptedAttachmentDTO;
                console.log('Attachment saved', decryptedAttachmentDTO);
                fileToUpload.status = FileUploadStatus.SUCCESS;
                fileToUpload.uploaded = true;
                fileToUpload.dto = decryptedAttachmentDTO;
                updateFile(fileToUpload, allFiles);
                setQueueSize(uploadQueueSize-1)
                setActiveIndex(fileToUpload.index)
                // TODO: add file processing - like extracting preview from PDF etc.
                if(onUploadSuccess)  onUploadSuccess(fileToUpload, { files: value as UploadedFile[], queueSize: uploadQueueSize });
              } else {
                console.log("File upload error " + result.message);
                toast.error("File upload error " + result.message);
                fileToUpload.status = FileUploadStatus.ERROR;
                updateFile(fileToUpload, allFiles);
                setQueueSize(uploadQueueSize-1)
                setActiveIndex(fileToUpload.index)
                if(onUploadError) onUploadError(fileToUpload, { files: value as UploadedFile[], queueSize: uploadQueueSize });
              }
            } catch (error) {
              console.log("File upload error " + error);
              toast('File upload error ' + error);
              toast.error('File upload error ' + error);
              fileToUpload.status = FileUploadStatus.ERROR;
              updateFile(fileToUpload, allFiles);
              setQueueSize(uploadQueueSize-1)
              setActiveIndex(fileToUpload.index)
              if(onUploadError) onUploadError(fileToUpload, { files: value as UploadedFile[], queueSize: uploadQueueSize-1 });
            }
          }
        }
    }, [value, uploadQueueSize, dbContext, onUploadError, onUploadSuccess, updateFile]);



    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        const files = acceptedFiles;

        if (!files) {
          toast.error("file error , probably too big");
          return;
        }

        const newValues: UploadedFile[] = value ? [...value] : [];

        if (reSelectAll) {
          newValues.splice(0, newValues.length);
        }

        let maxIdx = newValues.map((f) => f.index).reduce((a, b) => Math.max(a, b), -1);
        let idx = maxIdx + 1;
        const filesToBeUploaded:UploadedFile[] = []
        files.forEach((file) => {
          if (newValues.length < maxFiles && newValues.find((f) => f.file.name === file.name) === undefined) {
            let uploadedFile:UploadedFile = {
                id: '',
                file: file,
                uploaded: false,
                status: FileUploadStatus.UPLOADING,
                index: idx,
                dto: null
            }
            idx++;
            filesToBeUploaded.push(uploadedFile);
            setQueueSize(uploadQueueSize+1)
            newValues.push(uploadedFile);
          } else {
            toast.error("File already exists or max files reached");
          }
        });
        onValueChange(newValues);
        filesToBeUploaded.forEach((fileToUpload) => onInternalUpload(fileToUpload, newValues));

        if (rejectedFiles.length > 0) {
          for (let i = 0; i < rejectedFiles.length; i++) {
            if (rejectedFiles[i].errors[0]?.code === "file-too-large") {
              toast.error(
                `File is too large. Max size is ${maxSize / 1024 / 1024}MB`
              );
              break;
            }
            if (rejectedFiles[i].errors[0]?.message) {
              toast.error(rejectedFiles[i].errors[0].message);
              break;
            }
          }
        }
      },
      [reSelectAll, value, maxFiles, maxSize, onValueChange, onInternalUpload, uploadQueueSize]
    );

    useEffect(() => {
      if (!value) return;
      if (value.length === maxFiles) {
        setIsLOF(true);
        return;
      }
      setIsLOF(false);
    }, [value, maxFiles]);

    const opts = dropzoneOptions
      ? dropzoneOptions
      : { accept, maxFiles, maxSize, multiple };

    const dropzoneState = useDropzone({
      ...opts,
      onDrop,
      onDropRejected: () => setIsFileTooBig(true),
      onDropAccepted: () => setIsFileTooBig(false),
    });

    return (
      <FileUploaderContext.Provider
        value={{
          dropzoneState,
          isLOF,
          isFileTooBig,
          removeFileFromSet,
          activeIndex,
          setActiveIndex,
          orientation,
          direction
        }}
      >
        <div
          ref={ref}
          tabIndex={0}
          onKeyDownCapture={handleKeyDown}
          className={cn(
            "grid w-full focus:outline-none overflow-hidden ",
            className,
            {
              "gap-2": value && value.length > 0,
            }
          )}
          dir={dir}
          {...props}
        >
          {children}
        </div>
      </FileUploaderContext.Provider>
    );
  }
);

EncryptedAttachmentUploader.displayName = "FileUploader";

export const FileUploaderContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { orientation } = useFileUpload();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn("w-full px-1")}
      ref={containerRef}
      aria-description="content file holder"
    >
      <div
        {...props}
        ref={ref}
        className={cn(
          "flex rounded-xl gap-1",
          orientation === "horizontal" ? "flex-raw flex-wrap" : "flex-col",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
});

FileUploaderContent.displayName = "FileUploaderContent";

export const FileUploaderItem = forwardRef<
  HTMLDivElement,
  { index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, children, ...props }, ref) => {
  const { removeFileFromSet, activeIndex, direction } = useFileUpload();
  const isSelected = index === activeIndex;
  return (
    <div
      ref={ref}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "h-6 p-1 justify-between cursor-pointer relative",
        className,
        isSelected ? "bg-muted" : ""
      )}
      {...props}
    >
      <div className="font-medium leading-none tracking-tight flex items-center gap-1.5 h-full w-full">
        {children}
      </div>
      <button
        type="button"
        className={cn(
          "absolute",
          direction === "rtl" ? "top-1 left-1" : "top-1 right-1"
        )}
        onClick={() => removeFileFromSet(index)}
      >
        <span className="sr-only">remove item {index}</span>
        <RemoveIcon className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
      </button>
    </div>
  );
});

FileUploaderItem.displayName = "FileUploaderItem";

export const FileInput = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
  const rootProps = isLOF ? {} : dropzoneState.getRootProps();
  return (
    <div
      ref={ref}
      {...props}
      className={`relative w-full ${
        isLOF ? "opacity-50 cursor-not-allowed " : "cursor-pointer "
      }`}
    >
      <div
        className={cn(
          `w-full rounded-lg duration-300 ease-in-out
         ${
           dropzoneState.isDragAccept
             ? "border-green-500"
             : dropzoneState.isDragReject || isFileTooBig
             ? "border-red-500"
             : "border-zinc-300"
         }`,
          className
        )}
        {...rootProps}
      >
        {children}
      </div>
      <Input
        ref={dropzoneState.inputRef}
        disabled={isLOF}
        {...dropzoneState.getInputProps()}
        className={`${isLOF ? "cursor-not-allowed" : ""}`}
      />
    </div>
  );
});

FileInput.displayName = "FileInput";
