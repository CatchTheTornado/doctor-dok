export const requiredTerms: {
    [key: string]: {
        title: string;
        content: string | JSX.Element;
        contentPlain?: string;
    };
} = {
    generalTermsConsent: {
        title: 'General terms of service and privacy',
        content: <p>I hereby that I read and accepted the <a className="underline" target="_blank" href="/content/terms">Terms of Service</a> and <a className="underline" target="_blank" href="/content/privacy">Privacy Policy</a> of Doctor Dok.</p>,
        contentPlain: 'I confirm that I read and accepted the Terms of Service and Privacy Policy of Doctor Dok.'
    },
    dataPrivacyConsent: {
        title: 'Personal Information Handling',
        content: 'I commit to removing all personal information from the files uploaded to Doctor Dok. I am aware that if I fail to do so, the data will be sent to OpenAI Chat GPT for processing.'
    },
    aiProcessing: {
        title: 'Using AI for Processing',
        content: 'I understand that any data I upload, prompt, or input into the chat feature of Doctor Dok will be sent to Chat GPT AI for processing as an integral part of Doctor Dok’s core functionality.'
    },
    aiLimitationsAwareness: {
        title: 'AI Limitations Awareness',
        content: 'I acknowledge that Chat GPT AI may generate inaccurate information and should not be relied upon as a primary source of medical information.'
    }
}