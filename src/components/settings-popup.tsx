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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { set } from "react-hook-form";

const ocrLlanguages = [
  { name: "English", code: "eng" },
  { name: "Polish", code: "pol" },
  { name: "Portuguese", code: "por" },
  { name: "Afrikaans", code: "afr" },
  { name: "Albanian", code: "sqi" },
  { name: "Amharic", code: "amh" },
  { name: "Arabic", code: "ara" },
  { name: "Assamese", code: "asm" },
  { name: "Azerbaijani", code: "aze" },
  { name: "Azerbaijani - Cyrillic", code: "aze_cyrl" },
  { name: "Basque", code: "eus" },
  { name: "Belarusian", code: "bel" },
  { name: "Bengali", code: "ben" },
  { name: "Bosnian", code: "bos" },
  { name: "Bulgarian", code: "bul" },
  { name: "Burmese", code: "mya" },
  { name: "Catalan; Valencian", code: "cat" },
  { name: "Cebuano", code: "ceb" },
  { name: "Central Khmer", code: "khm" },
  { name: "Cherokee", code: "chr" },
  { name: "Chinese - Simplified", code: "chi_sim" },
  { name: "Chinese - Traditional", code: "chi_tra" },
  { name: "Croatian", code: "hrv" },
  { name: "Czech", code: "ces" },
  { name: "Danish", code: "dan" },
  { name: "Dutch; Flemish", code: "nld" },
  { name: "Dzongkha", code: "dzo" },
  { name: "English, Middle (1100-1500)", code: "enm" },
  { name: "Esperanto", code: "epo" },
  { name: "Estonian", code: "est" },
  { name: "Finnish", code: "fin" },
  { name: "French", code: "fra" },
  { name: "French, Middle (ca. 1400-1600)", code: "frm" },
  { name: "Galician", code: "glg" },
  { name: "Georgian", code: "kat" },
  { name: "German", code: "deu" },
  { name: "German Fraktur", code: "frk" },
  { name: "Greek, Modern (1453-)", code: "ell" },
  { name: "Greek, Ancient (-1453)", code: "grc" },
  { name: "Gujarati", code: "guj" },
  { name: "Haitian; Haitian Creole", code: "hat" },
  { name: "Hebrew", code: "heb" },
  { name: "Hindi", code: "hin" },
  { name: "Hungarian", code: "hun" },
  { name: "Icelandic", code: "isl" },
  { name: "Indonesian", code: "ind" },
  { name: "Inuktitut", code: "iku" },
  { name: "Irish", code: "gle" },
  { name: "Italian", code: "ita" },
  { name: "Japanese", code: "jpn" },
  { name: "Javanese", code: "jav" },
  { name: "Kannada", code: "kan" },
  { name: "Kazakh", code: "kaz" },
  { name: "Kirghiz; Kyrgyz", code: "kir" },
  { name: "Korean", code: "kor" },
  { name: "Kurdish", code: "kur" },
  { name: "Lao", code: "lao" },
  { name: "Latin", code: "lat" },
  { name: "Latvian", code: "lav" },
  { name: "Lithuanian", code: "lit" },
  { name: "Macedonian", code: "mkd" },
  { name: "Malay", code: "msa" },
  { name: "Malayalam", code: "mal" },
  { name: "Maltese", code: "mlt" },
  { name: "Marathi", code: "mar" },
  { name: "Nepali", code: "nep" },
  { name: "Norwegian", code: "nor" },
  { name: "Oriya", code: "ori" },
  { name: "Panjabi; Punjabi", code: "pan" },
  { name: "Persian", code: "fas" },
  { name: "Pushto; Pashto", code: "pus" },
  { name: "Romanian; Moldavian; Moldovan", code: "ron" },
  { name: "Russian", code: "rus" },
  { name: "Sanskrit", code: "san" },
  { name: "Serbian", code: "srp" },
  { name: "Serbian - Latin", code: "srp_latn" },
  { name: "Sinhala; Sinhalese", code: "sin" },
  { name: "Slovak", code: "slk" },
  { name: "Slovenian", code: "slv" },
  { name: "Spanish; Castilian", code: "spa" },
  { name: "Swahili", code: "swa" },
  { name: "Swedish", code: "swe" },
  { name: "Syriac", code: "syr" },
  { name: "Tagalog", code: "tgl" },
  { name: "Tajik", code: "tgk" },
  { name: "Tamil", code: "tam" },
  { name: "Telugu", code: "tel" },
  { name: "Thai", code: "tha" },
  { name: "Tibetan", code: "bod" },
  { name: "Tigrinya", code: "tir" },
  { name: "Turkish", code: "tur" },
  { name: "Uighur; Uyghur", code: "uig" },
  { name: "Ukrainian", code: "ukr" },
  { name: "Urdu", code: "urd" },
  { name: "Uzbek", code: "uzb" },
  { name: "Uzbek - Cyrillic", code: "uzb_cyrl" },
  { name: "Vietnamese", code: "vie" },
  { name: "Welsh", code: "cym" },
  { name: "Yiddish", code: "yid" },
];

export function SettingsPopup() {
  const config = useContext(ConfigContext);
  const [ocrProvider, setOcrProvider] = useState("chatgpt");
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [llmProviderChat, setLlmProviderChat] = useState("chatgpt")
  const [llmProviderParse, setLlmProviderParse] = useState("chatgpt")
  const [llmProviderRemovePII, setLlmProviderRemovePII] = useState("");
  const [ollamaModel, setOllamaModel] = useState("llama3.1")

  const { handleSubmit, register, setError, getValues, setValue, formState: { errors,  } } = useForm({
      defaultValues: {
        chatGptApiKey: "",
        displayAttachmentPreviews: true,
        ocrProvider: "chatgpt",
        ocrLanguage: "eng",
        ollamaUrl: ""

    }
  });

  useEffect(() => {  // load default configuration
    async function fetchDefaultConfig() {
      const chatGptKey = await config?.getServerConfig('chatGptApiKey');
      const displayAttachmentPreviews = await config?.getServerConfig('displayAttachmentPreviews');
      const ocr = await config?.getServerConfig('ocrProvider') as string      
      const ocrLang = await config?.getServerConfig('ocrLanguage') as string
      const ollamaUrl = await config?.getServerConfig('ollamaUrl') as string
      const ollamaModel = await config?.getServerConfig('ollamaModel') as string
      const llmProviderChat = await config?.getServerConfig('llmProviderChat') as string;
      const llmProviderParse = await config?.getServerConfig('llmProviderParse') as string;
      const llmProviderRemovePII = await config?.getServerConfig('llmProviderRemovePII') as string;
      setOcrProvider(ocr);
      setOcrLanguage(ocrLang);
      setLlmProviderChat(llmProviderChat);
      setLlmProviderParse(llmProviderParse);
      setLlmProviderRemovePII(llmProviderRemovePII);
      setOllamaModel(ollamaModel)
    

      setValue("chatGptApiKey", chatGptKey as string);
      setValue("displayAttachmentPreviews", displayAttachmentPreviews as boolean);
      setValue("ocrProvider", ocr);
      setValue("ocrLanguage", "eng");
      setValue("llmProviderChat", "chatgpt");
      setValue("llmProviderParse", "chatgpt");
      setValue("ollamaModel", "llama3.1");
      setValue("ollamaUrl", ollamaUrl);
      setValue("llmProviderRemovePII", llmProviderRemovePII);
    }
    fetchDefaultConfig();
  }, []);

  async function onSubmit(formData) { // TODO: we probably need a method in the config-context to setup the config model - so all available server and local config variables  with default values
    config?.setServerConfig('chatGptApiKey', formData['chatGptApiKey']);
    config?.setServerConfig('ocrProvider', ocrProvider as string);
    config?.setServerConfig('displayAttachmentPreviews', formData['displayAttachmentPreviews']);
    config?.setServerConfig('ocrLanguage', ocrLanguage as string);
    config?.setServerConfig('llmProviderChat', llmProviderChat as string || 'chatgpt');
    config?.setServerConfig('llmProviderParse', llmProviderParse as string || 'chatgpt');
    config?.setServerConfig('llmProviderRemovePII', llmProviderRemovePII as string || 'skip');
    config?.setServerConfig('ollamaUrl', formData['ollamaUrl']);
    config?.setServerConfig('ollamaModel', ollamaModel as string || 'llama3.1');
    config?.setConfigDialogOpen(false);
  }


  return (
    <Credenza open={config?.isConfigDialogOpen} onOpenChange={config?.setConfigDialogOpen}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950">
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="cloud-ai-settings">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cloud-ai-settings" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">Cloud AI</TabsTrigger>
                <TabsTrigger value="local-ai-settings" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">Local AI & GDPR</TabsTrigger>
                <TabsTrigger value="general-settings" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">General Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="general-settings">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Setup application settings here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input className="w-4 h-4" 
                        type="checkbox"
                        id="displayAttachmentPreviews"
                        {...register("displayAttachmentPreviews")}/>
                      <Label htmlFor="displayAttachmentPreviews">Display Attachment previews in records</Label>
                    </div>  
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="local-ai-settings">
                <Card>
                  <CardHeader>Local AI Models & OCR</CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 w-[305px]">
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor="ocrProvider">OCR Provider</Label>
                        <Select id="ocrProvider" value={ocrProvider} onValueChange={setOcrProvider}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Default: Chat GPT" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="chatgpt" value="chatgpt">Cloud: Chat GPT</SelectItem>
                            <SelectItem key="tesseract" value="tesseract">Browser: Tesseract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor="ocrLanguage">OCR Language</Label>
                        <Select id="ocrLanguage" value={ocrLanguage} onValueChange={setOcrLanguage}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Default: English" />
                          </SelectTrigger>
                          <SelectContent>
                          {ocrLlanguages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                            ))}                          
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor="llmProviderChat">LLM for Chat</Label>
                        <Select id="llmProviderChat" value={llmProviderChat} onValueChange={setLlmProviderChat}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Default: Chat GPT" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="chatgpt" value="chatgpt">Cloud: Chat GPT</SelectItem>
                            <SelectItem key="ollama" value="ollama">Local: Ollama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor="llmProviderParse">LLM for Parse</Label>
                        <Select id="llmProviderParse" value={llmProviderParse} onValueChange={setLlmProviderParse}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Default: Chat GPT" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="chatgpt" value="chatgpt">Cloud: Chat GPT</SelectItem>
                            <SelectItem key="ollama" value="ollama">Local: Ollama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor="llmProviderRemovePII">LLM for removing PII</Label>
                        <Select id="llmProviderRemovePII" value={llmProviderRemovePII} onValueChange={setLlmProviderRemovePII}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Default: None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="skip" value="skip">Don't remove personal data</SelectItem>
                            <SelectItem key="ollama" value="ollama">Local: Ollama</SelectItem>
                            <SelectItem key="replace" value="replace">Basic: Replace strings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>                     
                      <div>
                        <Label htmlFor="ollamaUrl">Ollama URL:</Label>
                        <Input
                          type="text"
                          id="ollamaUrl"
                          {...register("ollamaUrl", { required: false, validate: {
                            ollamaUrlValidator: (value) => true
                          }} )}
                        />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor="llmProviderParse">Ollama model</Label>
                        <Select id="llmProviderParse" value={ollamaModel} onValueChange={setOllamaModel}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Default: Llama 3.1" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="llama3.1" value="llama3.1">LLama 3.1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>                      
                    </div>
                    <div className="text-xs">
                        Local models are used for processing data on local server where it IS NOT STORED. You can use Local models to remove personal information from attachments before sending it to Cloud AI providers or used it for all purposes (Local Parse + Cloud Chat mode).
                      </div>

                  </div>               
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="cloud-ai-settings">
                <Card>
                  <CardHeader>Cloud AI providers:</CardHeader>
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
                  <Button type="button" onClick={() => config?.setConfigDialogOpen(false)}>Cancel</Button>
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


