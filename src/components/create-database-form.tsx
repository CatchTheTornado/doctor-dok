"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { databaseIdValidator, userKeyValidator } from "@/data/client/models";
import { PasswordInput } from "./ui/password-input";
import { ReactElement, use, useContext, useEffect, useState } from "react"
import { Checkbox } from "./ui/checkbox";
import NoSSR  from "react-no-ssr"
import { CreateDatabaseResult, DatabaseContext } from "@/contexts/db-context";
import { generateEncryptionKey } from "@/lib/crypto";
import { CopyIcon, EyeIcon, EyeOffIcon, PrinterIcon, WandIcon } from "lucide-react";
import { KeyPrint } from "./key-print";
import { pdf, Document, Page } from '@react-pdf/renderer';
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";


interface CreateDatabaseFormProps {
}

export function CreateDatabaseForm({  
}: CreateDatabaseFormProps) {
  const { register, setValue, getValues, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      databaseId: '',
      key: generateEncryptionKey()
    }
  });

  const [operationResult, setOperationResult] = useState<CreateDatabaseResult | null>(null);
  const [showPassword, setShowPassword] = useState(false)
  const [printKey, setPrintKey] = useState<ReactElement | null>(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem("keepLoggedIn") === "true" : false)
  const dbContext = useContext(DatabaseContext);

  useEffect(() => { 
    setOperationResult(null);
    // TODO: load credentials from local storage
  }, []);
  const handleCreateDatabase = handleSubmit(async (data) => {
    // Handle form submission
    const result = await dbContext?.create({
      databaseId: data.databaseId,
      key: data.key
    });

    if (keepLoggedIn){
      localStorage.setItem("databaseId", data.databaseId);
      localStorage.setItem("key", data.key);
    }
    setOperationResult(result);
    if(result?.success) {
      toast.success(result?.message);
    } else {
      toast.error(result?.message);
    }
  });

  if (operationResult?.success) {
    return (<div className="flex flex-col space-y-2 gap-2 mb-4">
      <h2 className="text-green-500 text-bold">Congratulations!</h2>
      <p className="text-sm">Database has ben successfully created. Please store the credentials in safe place as they are <strong>NEVER send to server</strong> and thus <strong>CAN NOT be recovered</strong></p>
      <div className="border-2 border-dashed border-green-400 p-5">
        <div className="text-sm mb-5">
          <Label htmlFor="databaseId">Database ID:</Label>
          <Input id="databaseId" readOnly value={dbContext?.databaseId} />
        </div>
        <div className="text-sm">
          <Label htmlFor="encryptionKey">User Key:</Label>
          <Textarea id="encryptionKey" readOnly value={dbContext?.encryptionKey} />
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="p-1 h-10 p-2" onClick={async (e) => {
            e.preventDefault();
            const keyPrinterPdf = pdf(KeyPrint({ key: dbContext?.encryptionKey, databaseId: dbContext?.databaseId }));
            window.open(URL.createObjectURL(await keyPrinterPdf.toBlob()));
          }}><PrinterIcon className="w-4 h-4" /> Print</Button>
          <Button variant="outline" className="p-1 h-10 p-2" onClick={async (e) => {
            e.preventDefault();
            const textToCopy = 'Database Id: '+ dbContext?.databaseId + "\nKey Id: " + dbContext?.encryptionKey;
            if ('clipboard' in navigator) {
              navigator.clipboard.writeText(textToCopy);
            } else {
              document.execCommand('copy', true, textToCopy);
            }                
          }}><CopyIcon className="w-4 h-4" /> Copy to clipboard</Button>             
        </div>
      </div>


      <Button onClick={() => {
        setOperationResult(null);
        dbContext?.authorize({ // this will authorize the database and in a side effect close this popup
          databaseId: dbContext?.databaseId,
          key: dbContext?.encryptionKey,
          keepLoggedIn: keepLoggedIn
        });
      }}>Go to application</Button>
    </div>)
  } else  {
    return (
      <form onSubmit={handleCreateDatabase}>
        <div className="flex flex-col space-y-2 gap-2 mb-4">
          {operationResult ? (
            <div>
              <p className={operationResult.success ? "p-3 border-2 border-green-500 background-green-200 text-sm font-semibold text-green-500" : "background-red-200 p-3 border-red-500 border-2 text-sm font-semibold text-red-500"}>{operationResult.message}</p>
              <ul>
                {operationResult.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Label htmlFor="databaseId">Database ID</Label>
          <Input autoFocus 
            type="text"
            id="databaseId"
            {...register("databaseId", { required: true,
              validate: {
                databaseId: databaseIdValidator
              }
            })}
          />
          {errors.databaseId && <span className="text-red-500 text-sm">Database Id must be at least 6 letters and/or digits and unique</span>}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Please pick a unique database id. We do not store this name. It could be your Personal ID if you like or any other unique name, at least 6 letters or digits.
          </p>        

        </div>
        <div className="flex flex-col space-y-2 gap-2 mb-4">
              <Label htmlFor="key">User Key</Label>
              <div className="flex gap-2">
                <div className="relative">
                  <PasswordInput autoComplete="new-password" id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register("key", { required: true,
                          validate: {
                              key: userKeyValidator
                          }            
                          })}                        />
                      <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-0"
                          onClick={() => setShowPassword((prev) => !prev)}
                      >
                          {showPassword ? (
                          <EyeIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                          />
                          ) : (
                          <EyeOffIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                          />
                          )}
                          <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                          </span>
                      </Button>

                      {/* hides browsers password toggles */}
                      <style>{`
                          .hide-password-toggle::-ms-reveal,
                          .hide-password-toggle::-ms-clear {
                          visibility: hidden;
                          pointer-events: none;
                          display: none;
                          }
                      `}</style>
                </div>
                <Button variant="outline" className="p-1 h-10 w-10" onClick={(e) => {
                  e.preventDefault();
                  setValue('key', generateEncryptionKey());
                  setShowPassword(true);
                }}><WandIcon className="w-4 h-4" /></Button>
                <Button variant="outline" className="p-1 h-10 w-10" onClick={async (e) => {
                  e.preventDefault();
                  const keyPrinterPdf = pdf(KeyPrint({ key: getValues().key, databaseId: getValues().databaseId }));
                  window.open(URL.createObjectURL(await keyPrinterPdf.toBlob()));
                }}><PrinterIcon className="w-4 h-4" /></Button>
                <Button variant="outline" className="p-1 h-10 w-10" onClick={async (e) => {
                  e.preventDefault();
                  const textToCopy = 'Database Id: '+ getValues().databaseId + "\nKey Id: " + getValues().key;
                  if ('clipboard' in navigator) {
                    navigator.clipboard.writeText(textToCopy);
                  } else {
                    document.execCommand('copy', true, textToCopy);
                  }                
                }}><CopyIcon className="w-4 h-4" /></Button>              
              </div>
              <div>
                {printKey}
              </div>
              {errors.key && <span className="text-red-500 text-sm">Key must be at least 8 characters length including digits, alpha, lower and upper letters.</span>}
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Please save or print this master key. <strong>It's like crypto wallet.</strong> After losing it your medical records <strong className="text-red-500">WILL BE LOST FOREVER</strong>.
              We're using strong AES256 end-to-end encryption.
          </p>        
        </div>
        <div className="flex items-center justify-between gap-4 mt-4">
          <NoSSR>
            <div className="flex items-center gap-2">
              <Checkbox
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onCheckedChange={(checked) => {
                  setKeepLoggedIn(checked);
                  localStorage.setItem("keepLoggedIn", checked.toString());
                      }}
              />
              <label htmlFor="keepLoggedIn" className="text-sm">Keep me logged in</label>
            </div>      
          </NoSSR>
          <div className="items-center flex justify-center">
              <Button type="submit">Create database</Button>
          </div>
        </div>
      </form>
    );
  }
}
