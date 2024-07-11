"use client"

import { useContext, useEffect, useState } from "react"
import { Credenza, CredenzaTrigger, CredenzaContent, CredenzaFooter } from "@/components/credenza"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfigContext } from "@/contexts/config-context"
import { PasswordInput } from "./ui/password-input"
import { generateEncryptionKey } from "@/lib/crypto"
import ReactToPrint from "react-to-print";
import { KeyPrint } from "./key-print"
import React from "react"
import { DataLinkStatus } from "@/data/client/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function SettingsPopup() {
  const config = useContext(ConfigContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  
  // form setup
  let encryptionKey = config?.getLocalConfig('encryptionKey');
  if (!encryptionKey) {
    encryptionKey = generateEncryptionKey();
    config?.setLocalConfig('encryptionKey', encryptionKey);
  }
  const { handleSubmit, register, setError, getValues, formState: { errors,  } } = useForm({
      defaultValues: {
        encryptionKey,
        chatGptApiKey: config?.localConfig.chatGptApiKey || ""
    }
  });


  // encryption key print
  const componentRef = React.useRef(null);
  const reactToPrintContent = React.useCallback(() => {
    return componentRef.current;
  }, [componentRef.current]);
  const reactToPrintTrigger = React.useCallback(() => {
    return <Button variant="ghost">Print encryption key</Button>;
  }, []);

 

  useEffect(() => {
    if (config?.dataLinkStatus.isError() === true || config?.dataLinkStatus.isEmpty() === true) setDialogOpen(true);
    if (config?.dataLinkStatus.status === DataLinkStatus.AuthorizationError) {
      toast("Authorization error", {
        description: "Invalid encryption key. Please try again with different key or create a new database",
        duration: 2000
      });
    } 
    if (config?.dataLinkStatus.status === DataLinkStatus.Empty) { 
      toast("Authorization error", {
        description: "Database is empty. Please create a new database with new encryption key",
        duration: 2000
      });      
    }
  }, [config?.dataLinkStatus]);

  async function formatNewDataLink(newEncryptionKey: string) {
    await config?.formatNewDataLink(newEncryptionKey, {});
    await config?.authorizeDataLink(newEncryptionKey); // authorize once ogain
    toast.info('New database created. Please save or print your encryption key.');
    config?.setLocalConfig('encryptionKey', newEncryptionKey); // TODO: force data reload everywhere in the app
    setDialogOpen(false);
  }


  async function validateEncryptionKey(value): Promise<boolean> {
    // try to authorize db
    const authorizationResult = await config?.authorizeDataLink(value); // try to authorize the DB or check if new DB is required
    const dataLinkStatus = authorizationResult?.status;

    if (dataLinkStatus?.status === DataLinkStatus.AuthorizationError) {
      return false;
    }  else if (dataLinkStatus?.status === DataLinkStatus.Empty) {
      return false;
    } else if (dataLinkStatus?.status === DataLinkStatus.Authorized) {
      return true;
    }

    return true;
  }

  async function onSubmit(formData) {
    config?.setLocalConfig('chatGptApiKey', formData['chatGptApiKey']);

    const authorizationResult = await config?.authorizeDataLink(formData['encryptionKey']); // try to authorize the DB or check if new DB is required
    const dataLinkStatus = authorizationResult?.status;

    if (dataLinkStatus?.status === DataLinkStatus.AuthorizationError) {
      setDialogOpen(true);
    } else {
      if (dataLinkStatus?.status === DataLinkStatus.Empty) {
        await formatNewDataLink(formData['encryptionKey']); // create new database with newly generated master data encryption key
        toast.info('New database created. Please save or print your encryption key.');
      } else  if (dataLinkStatus?.status === DataLinkStatus.Authorized) { // store the encryption key bc it's valid
        toast.info('Database succesfully authorized and encrypted. You can now safely use the app.');
      }

      config?.setLocalConfig('encryptionKey', formData['encryptionKey'] as string);
      setDialogOpen(false);

    }
  }


  return (
    <Credenza open={dialogOpen} onOpenChange={setDialogOpen}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950">
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="auth">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="auth">Authorization</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="auth">
                <Card>
                  <CardHeader>
                    <CardTitle>Encryption</CardTitle>
                    <CardDescription>
                      Setup encryption key for your medical records
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="hidden">
                      <KeyPrint ref={componentRef} text={encryptionKey} />
                    </div>
                    <Label htmlFor="encryptionKey">Encryption Key</Label>
                    <div className="relative">

                      <PasswordInput autoComplete="new-password" id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register("encryptionKey", { 
                          required: 'Encryption key is required', 
                          validate: {
                            required: (value) => (value as string).length > 0,
                            minLength: (value) => (value as string).length >= 5,
                            maxLength: (value) => (value as string).length <= 64,
                            validEncryptionKey: async (value) => validateEncryptionKey(value)
                          }
                        })}
                        />
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

                    {errors.encryptionKey ? (
                      <div>
                        <div>
                        {errors.encryptionKey.type === 'validEncryptionKey' ? (
                          <span className="text-red-500 text-sm">Provided encryption key is INVALID for existing database OR database is empty. You can ERASE and FORMAT a new database</span>
                          ):""}
                        {errors.encryptionKey.type === 'minLength' ? (
                          <span className="text-red-500 text-sm">Min length for a key is 5</span>
                          ):""}
                        {errors.encryptionKey.type === 'validEncryptionKey' ? (
                          <span className="text-red-500 text-sm">Max length for a key is 64</span>
                          ):""}
                        {errors.encryptionKey.type === 'required' ? (
                          <span className="text-red-500 text-sm">Encryption key is required</span>
                          ):""}                          
                        </div>

                          <AlertDialog>
                          <AlertDialogTrigger><Button variant="ghost">Format Datbase</Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-white dark:bg-zinc-950">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your data and create a new database with new encryption key.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={(e) => formatNewDataLink(getValues().encryptionKey as string)}>Erase ALL and continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>       
                      </div>           
                    ) : ""}
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Please save or print this master key. <strong>It's like crypto wallet.</strong> After losing it your medical records <strong className="text-red-500">WILL BE LOST FOREVER</strong>.
                      We're using strong AES256 end-to-end encryption.
                    </p>

                    <ReactToPrint
                      content={reactToPrintContent}
                      documentTitle="Patient Pad Encryption Key"
                      removeAfterPrint
                      trigger={reactToPrintTrigger}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      Setup application settings here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="chatGptApiKey">ChatGPT API Key</Label>
                    <Input
                      type="text"
                      id="chatGptApiKey"
                      {...register("chatGptApiKey", { required: 'Chat GPT API key is required' , validate: {
                        keyFormatValidation: (value) => (value as string).startsWith('sk')
                      }} )}
                    />
                    {(errors.chatGptApiKey?.type === "keyFormatValidation") && <div><span className="text-red-500  text-sm">ChatGPT API key should start with "sk"</span></div>}
                    {errors.chatGptApiKey && <div><span className="text-red-500  text-sm">{errors.chatGptApiKey.message}</span></div>}
                    <div>
                      <Link href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key" target="_blank" className="text-sm text-blue-500 hover:underline" prefetch={false}>
                        How to obtain ChatGPT API Key
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <CredenzaFooter>
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saveToLocalStorage"
                    checked={config?.localConfig.saveToLocalStorage}
                    onCheckedChange={(checked) => config?.setSaveToLocalStorage(checked)}
                  />
                  <Label htmlFor="saveToLocalStorage">Save to localStorage</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Go!</Button>
                </div>
              </div>
            </CredenzaFooter>
          </form>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}

function SettingsIcon(props) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


