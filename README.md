## Patient Pad PWA App

**1 Password for Your Health**

Patient Pad is a patient health folder app; end 2 end encrypted including AI features (including data parsing, speech to text, chat with your health background etc.)

## Encrypted storage

All the health records (including file attachments) are **encrypted in the browser** before sending to the server. Your private key is never exchanged with the server. Therefore there's no way to access, take over or modify the data. The only exception is if you decide to use Chat GPT which is powering data-parsing, summary, context and conclusion making processes. Even if so, you're up to enter your own Chat GPT API key and the data is being sent directly from your browser to chatGPT subject to [OpenAI privacy policies](https://openai.com/pl-PL/policies/eu-privacy-policy/).

## Getting Started

Virtually no external dependencies. This app uses SQLite to store per-user database of patients and health records. To start the app just run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## License

Patient Pad is released under [MIT](LICENSE) license.