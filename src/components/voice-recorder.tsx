"use client"
import { useWhisper } from '@chengsokdara/use-whisper'
import { Button } from '@/components/ui/button'
import { useState, useEffect, PropsWithChildren } from 'react'
import { LoaderPinwheel } from 'lucide-react'
import { Select, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { SelectContent, SelectGroup } from '@radix-ui/react-select'

const VoiceRecorder: React.FC<PropsWithChildren<{
    chatGptKey: string,
    onTranscriptionChange: (transcription: string) => void
}>> = ({ children, chatGptKey, onTranscriptionChange }) => {
    const [transcription, setTranscription] = useState('Click "Start Recording" to begin transcription ...');
    const [language, setLanguage] = useState('en');
    const {
        recording,
        speaking,
        transcribing,    
        transcript,
        pauseRecording,
        startRecording,
        stopRecording,
    } = useWhisper({
        apiKey: chatGptKey as string,
        removeSilence: false,
        autoTranscribe: true,
        timeSlice: 5_000, // 1 second
        streaming: true,       
        whisperConfig: {
            language,
            prompt: 'conversation about health, medical topics - maybe between doctor and patient',
            temperature: 0.8
        },
        mode: 'transcriptions'
    });

    useEffect(() => {
        if (transcript.text) {
            onTranscriptionChange(transcript.text);
        }
        setTranscription(transcript.text as string);
    }, [transcript.text]);

    const languageNames = {
        en: 'English',
        pl: 'Polish',
        zh: 'Chinese',
        de: 'German',
        es: 'Spanish',
        ru: 'Russian',
        // add more language names here
        ar: 'Arabic',
        bn: 'Bengali',
        cs: 'Czech',
        da: 'Danish',
        nl: 'Dutch',
        fi: 'Finnish',
        fr: 'French',
        el: 'Greek',
        he: 'Hebrew',
        hi: 'Hindi',
        hu: 'Hungarian',
        id: 'Indonesian',
        it: 'Italian',
        ja: 'Japanese',
        ko: 'Korean',
        ms: 'Malay',
        no: 'Norwegian',
        pt: 'Portuguese',
        ro: 'Romanian',
        sk: 'Slovak',
        sv: 'Swedish',
        th: 'Thai',
        tr: 'Turkish',
        uk: 'Ukrainian',
        vi: 'Vietnamese',
        cy: 'Welsh',
    };

    return (
        <div>
            <div className="gap-4 flex">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {Object.entries(languageNames).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>      
                <Button disabled={recording} onClick={(e) => { e.preventDefault(); startRecording(); }}>Start Recording</Button>
                <Button disabled={!recording} onClick={(e) => { e.preventDefault(); stopRecording(); }}>Stop Recording</Button>
            </div>
            <div className="pt-4 pb-4">
                <p>Transcription:</p>
                <textarea onChange={(e) => { e.target.scrollTop = e.target.scrollHeight }} className="w-full rounded-md h-32 border-dashed border-2 border-gray-500" value={transcription} readOnly></textarea>
            </div>
        </div>
    );
}


export default VoiceRecorder