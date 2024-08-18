<p align="center">
    <img width="200" src="public/img/patient-pad-logo.svg" />
</p>

## Patient Pad

**1 Password + AI for Health**

Patient Pad is a secure storage, digitization, sharing and AI discovery platform for all your family and/or patients health data.

All health history - digitalized - accesible anywhere from Mobile or Desktop. Using AI you may **translate your health records to one of 50+ languages** - making abroad health services more accesible.

Patient Pad uses AI to OCR even a hardly readable photo of your healt documents. Then stores it in cloud with [Zero Trust Security architecture](https://github.com/CatchTheTornado/patient-pad/issues/65) (no body but You can decrypt the data). 

Chat GPT, LLama 3.1 and other Ollama supported AI models avaialble.

<table>
    <tr>
        <td>
            <a href="readme-assets/screen0.png"><img src="readme-assets/screen0.png" alt="Example record view" /></a>
        </td>
        <td>
            <a href="readme-assets/screen1.png"><img src="readme-assets/screen1.png" alt="Multi patients support" /></a>
        </td>
        <td>
            <a href="readme-assets/screen2.png"><img src="readme-assets/screen2.png" alt="Adding health data in any format" /></a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="readme-assets/screen3.png"><img src="readme-assets/screen3.png" alt="Examination turned digital" /></a>
        </td>
        <td>
            <a href="readme-assets/screen4.png"><img src="readme-assets/screen4.png" alt="AI used for OCRing the data" /></a>
        </td>
        <td>
            <a href="readme-assets/screen5.png"><img src="readme-assets/screen5.png" alt="AI features" /></a>
        </td>
    </tr>
</table>


**Using AI Chat one might analyze years of medical history within seconds** self-formulating second opinions, checking possible treatments, checking medicine co-inferences etc.

## Key Features:

- Digitalize all your health data - even poor scans, converts it to JSON structuralized data,
- Chat with AI with selected or All your health records in the context,
- Translate your records to more 50+ languages,
- Chat GPT, LLama 3.1 and other Ollama supported AI models support,
- Tesseract OCR as an alternative OCR supported,
- PDF, PNG, JPG, TIFF, Text support,
- Standarized JSON data format storage,
- Multi page attachments support,
- Supports All types of medical records: Blood results, MRI Scans, RTG Scans, After-Visit reports ...
- Multi Patients support,
- PII (Personaly Identifiable Information) removal using AI or Blacklisting,
- End 2 End data encryption - [read about the architecture](https://github.com/CatchTheTornado/patient-pad/issues/65)
- Safe sharing within your family, with your physician etc - using Sharing Key feature,
- Access from Mobile or Desktop,
- Dark and Light themes supported,
- Full Rest API with JWT authorization for managing `patients`, `patinet-records`, `encrypted-attachments`, ai integrations and so on.
- 100% TypeScript, Next JS, React + Shadcn-ui tech stack.

## Use cases
- **End user** - using Patient Pad as health AI cloud,
- **Med provider** - using Patient Pad as secure framework EHR with per-patient sharing,
- **Med tech** - using Patient Pad as a framework for product development

## Structured data

Patient Pad uses standarized JSON format to which parses all input health records. By doing so it opens a way for all exciting new features like data summarization, diagraming, data compression, taking even years long health history into AI context. Things that previously were very difficult or even impossible for human beings.

## Encrypted storage

All the health records (including file attachments) are **encrypted in the browser** before sending to the server. Your private key is never exchanged with the server. Therefore there's no way to access, take over or modify the data. The only exception is if you decide to use Chat GPT which is powering data-parsing, summary, context and conclusion making processes. Even if so, you're up to enter your own Chat GPT API key and the data is being sent directly from your browser to chatGPT subject to [OpenAI privacy policies](https://openai.com/pl-PL/policies/eu-privacy-policy/).

## Getting Started

Virtually no external dependencies. This app uses SQLite to store per-user database of patients and health records. To start the app just run:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To use AI features make sure you set your chat GPT API Key in the settings.

Available ENV settings (overrides the UI settings):

```js
export const ENV_PROVIDED_CONFIG = {
  chatGptApiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
  displayAttachmentPreviews: process.env.NEXT_PUBLIC_DISPLAY_ATTACHMENT_PREVIEWS,
  ocrProvider: process.env.NEXT_PUBLIC_OCR_PROVIDER,
  ocrLanguage: process.env.NEXT_PUBLIC_OCR_LANGUAGE,
  ollamaUrl: process.env.NEXT_PUBLIC_OLLAMA_URL,
  ollamaModel: process.env.NEXT_PUBLIC_OLLAMA_MODEL,
  llmProviderChat: process.env.NEXT_PUBLIC_LLM_PROVIDER_CHAT,
  llmProviderParse: process.env.NEXT_PUBLIC_LLM_PROVIDER_PARSE,
  llmProviderRemovePII: process.env.NEXT_PUBLIC_LLM_PROVIDER_REMOVE_PII,
  piiGeneralData: process.env.NEXT_PUBLIC_PII_GENERAL_DATA
}
```


## License

Patient Pad is released under [MIT](LICENSE) license.