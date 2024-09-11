export const requiredTerms: {
    [key: string]: {
        title: string;
        content: string | JSX.Element;
        contentPlain?: string;
    };
} = {
    generalTermsConsent: {
        title: 'General terms of service',
        content: <p>I hereby confirm that I read and accepted the <a className="underline" href="/content/terms">general terms of service</a> of Doctor Dok.</p>,
        contentPlain: 'I hereby confirm that I read and accepted the general terms of service of Doctor Dok.'
    },
    dataPrivacyConsent: {
        title: 'Data Privacy Consent',
        content: 'I hereby confirm that I will be removing all Personal Information from the files uploaded to Doctor Dok and I agree otherwise the uploaded data might be send to Open AI Chat GPT.'
    },
    aiDataConsent: {
        title: 'AI Consent',
        content: 'I hereby confirm that my data will be send to Chat GPT AI for processing and I agree to the terms of service'
    },
    aiConfabulationConsent: {
        title: 'AI Confabulation Consent',
        content: 'I am aware that Chat GPT AI might confabulate and IN ANY CASE is NOT RELIABLE as primary medical information source.'
    }
}