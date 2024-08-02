"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { databaseIdValidator, userKeyValidator } from "@/data/client/models";
import { PasswordInput } from "./ui/password-input";
import { CopyIcon, EyeIcon, EyeOffIcon, PrinterIcon, WandIcon } from "lucide-react";
import { ReactElement, useContext, useState } from "react"
import { Checkbox } from "./ui/checkbox";
import NoSSR  from "react-no-ssr"
import { DatabaseContext } from "@/contexts/db-context";
import { generateEncryptionKey } from "@/lib/crypto";
import { KeyPrint } from "./key-print";
import { pdf, Document, Page } from '@react-pdf/renderer';


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
  const [showPassword, setShowPassword] = useState(false)
  const [printKey, setPrintKey] = useState<ReactElement | null>(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem("keepLoggedIn") === "true" : false)
  const dbContext = useContext(DatabaseContext);

  const handleCreateDatabase = handleSubmit((data) => {
    // Handle form submission
    dbContext?.create({
      databaseId: data.databaseId,
      key: data.key
    });
  });

  return (
    <form onSubmit={handleCreateDatabase}>
      <div className="flex flex-col space-y-2 gap-2 mb-4">
        <Label htmlFor="databaseId">Database ID</Label>
        <Input
          type="text"
          id="databaseId"
          {...register("databaseId", { required: true,
            validate: {
              databaseId: databaseIdValidator
            }
           })}
        />
        {errors.databaseId && <span className="text-red-500 text-sm">Database Id must be at least 6 letters and/or digits and unique</span>}
       </div>
      <div className="flex flex-col space-y-2 gap-2 mb-4">
            <Label htmlFor="key">Key</Label>
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
