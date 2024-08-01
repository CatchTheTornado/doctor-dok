"use client"

import { use, useContext, useEffect, useState } from "react"
import { Credenza, CredenzaTrigger, CredenzaContent, CredenzaFooter } from "@/components/credenza"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ConfigContext } from "@/contexts/config-context"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useForm } from "react-hook-form";


export function SettingsPopup() {
  const config = useContext(ConfigContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { handleSubmit, register, setError, getValues, setValue, formState: { errors,  } } = useForm({
      defaultValues: {
        chatGptApiKey: ""
    }
  });

  useEffect(() => {  // load default configuration
    async function fetchDefaultConfig() {
      const chatGptKey = await config?.getServerConfig('chatGptApiKey');
      setValue("chatGptApiKey", chatGptKey as string);
    }
  }, []);

  async function onSubmit(formData) {
    config?.setServerConfig('chatGptApiKey', formData['chatGptApiKey']);
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
                <TabsTrigger value="settings">AI Settings</TabsTrigger>
              </TabsList>
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


