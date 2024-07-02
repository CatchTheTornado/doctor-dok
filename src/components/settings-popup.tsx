/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/2K8codJtRYE
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
"use client"

import { useContext, useState } from "react"
import { Sheet, SheetClose, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import NoSSR from 'react-no-ssr';
import { ConfigContext } from "@/contexts/config-context"
import { PasswordInput } from "./ui/password-input"
import { generateEncryptionKey } from "@/lib/crypto"
import ReactToPrint from "react-to-print";
import { KeyPrint } from "./key-print"
import React from "react"
import { DBStatus } from "@/data/client/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Toaster, toast } from "sonner";

export function SettingsPopup() {
  const config = useContext(ConfigContext);
  const [open, setOpen] = useState(config?.dbStatus.status !== DBStatus.Authorized)

  let encryptionKey = config?.getLocalConfig('encryptionKey')
  if (!encryptionKey) {
    encryptionKey = generateEncryptionKey();
    config?.setLocalConfig('encryptionKey', encryptionKey);
  }
  const componentRef = React.useRef(null);
  const reactToPrintContent = React.useCallback(() => {
    return componentRef.current;
  }, [componentRef.current]);

  const reactToPrintTrigger = React.useCallback(() => {
    return <Button variant="ghost">Print encryption key</Button>;
  }, []);

  let [newEncryptionKey, setEncryptionKey] = useState(encryptionKey);
  let [newChatGptApiKey, setChatGptApiKey] = useState(config?.localConfig.chatGptApiKey || "");

  async function createNewDB() {
    await config?.createNewDB({});
    await config?.authorizeDB(newEncryptionKey as string); // authorize once ogain
    toast.info('New database created. Please save or print your encryption key.');    
  }

  function askBeforeCreateNewDB() {
    toast("Create empty Database?", { description: "Are you sure you want to ERASE and CREATE NEW database? All existing records will be lost",  duration: 5000, action: { label: 'YES', onClick: () => createNewDB() }});
  }

  async function handleSubmit(e){

    // TODO: add button for creating new database
    config?.setLocalConfig('chatGptApiKey', newChatGptApiKey);

    const authorizationToken = await config?.authorizeDB(newEncryptionKey as string); // try to authorize the DB or check if new DB is required
    const dbStatus = authorizationToken?.status;

    if (dbStatus?.status == DBStatus.AuthorizationError) {
      toast("Authorization error", { description: "Invalid encryption key. Please try again with different key or create a new database",  duration: 5000, action: { label: 'Create new DB', onClick: () => askBeforeCreateNewDB() }});
      return;
    }  else if (dbStatus?.status == DBStatus.Empty) {
      await createNewDB();
      toast.info('New database created. Please save or print your encryption key.');
      config?.setLocalConfig('encryptionKey', newEncryptionKey);
    } else if (dbStatus?.status === DBStatus.Authorized) {
      config?.setLocalConfig('encryptionKey', newEncryptionKey);
      toast.success('Database authorized!');
    }

    //passwordManager(e);
  }

/*  function passwordManager(e) {
    if (window.PasswordCredential) {
      var c = new PasswordCredential({ id: "patient-pad", password: encryptionKey });
      return navigator.credentials.store(c);
    } else return true;            
  }*/
  return (
    <NoSSR>
      <Sheet open={open}  onOpenChange={(value) =>{ if(!value && config?.dbStatus.status !== DBStatus.Authorized) setOpen(true); else setOpen(value); } }>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <SettingsIcon className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[425px]">
          <form onSubmit={(e) => {e.preventDefault(); handleSubmit(e);}}>
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
                        <KeyPrint ref={componentRef} text={encryptionKey}/>
                      </div>
                        <Label htmlFor="encryptionKey">Encryption Key</Label>
                        <PasswordInput  autoComplete="new-password" id="password" value={newEncryptionKey} 
                        onChange={(e) => setEncryptionKey(e.target.value)} />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                          value={newChatGptApiKey}
                          onChange={(e) => setChatGptApiKey(e.target.value)}
                        />
                        <Link href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key" target="_blank" className="text-sm text-blue-500 hover:underline" prefetch={false}>
                          How to obtain ChatGPT API Key
                        </Link>
                    </CardContent>
                  </Card>          
                </TabsContent>
              </Tabs>       
              <SheetFooter>
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
                    <SheetClose asChild>
                      <Button type="button">Cancel</Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button type="submit">Go!</Button>
                    </SheetClose>
                  </div>
              </div>
              <Toaster position="bottom-right" />
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </NoSSR>
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


