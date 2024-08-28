import { ConfigContextType } from "@/contexts/config-context";
import { Record, recordItemSchema } from "@/data/client/models";
import { zodToJsonSchema } from "zod-to-json-schema";

type PromptContext = {
    record?: Record;
    config?: ConfigContextType | null;
}
const itemSchema = zodToJsonSchema(recordItemSchema);

export const prompts = {
    recordParseMultimodal: (context: PromptContext) => {
        return 'This is my health result data. Please parse it to JSON array of records including all findings, records, details, tests results, medications, diagnosis and others. \
                First: JSON should be all in original language. \
                Each medical record should a row of returned JSON array of objects in format given below. If value contains multiple data (eg. numbers) store it as separate items. Freely extend it when needed to not miss any data!\
                Include the type of this results in english (eg. "blood_results", "rmi") in "type" key of JSON and then more detailed type in "subtype" key.  \
                Summary the record to one nice sentence and put it under "title". Extract max 3 keywords (min 4 chars each) and put it in "tags" key including one tag equal to year of this record tags can not be personal data. \
                Include the language of the document inside "language" key.  If the result is single block of text please try additionaly to saving text result  \
                extract very detailed and all features from it and put it as an array under "findings" key. Second: Markdown text - please do kind of OCR - so convert all the \
                attachments to text. Please use markdown to format it nicely and return after JSON object, \
                wrap it with  ```markdown on start and  ``` on end of the text. Do not add to the text anything not explicitly existing in the source documents. \r\n\r\n: \r\n\r\n```json\r\n \
                ' + JSON.stringify(itemSchema) + '```\r\n\r\n'
    }, // [ { type: "blood_results", subtype: "morphology", findings: [], ... }, {type: "mri", subtype: "head mri", ...}]
    recordParseOCR: (context: PromptContext, ocrText: string) => {
        return 'Below is my health result data in plain text. Parse it to JSON array of records including all findings, records, details, tests results, medications, diagnosis and others. \
                First: JSON should be all in original language. \
                Each medical record should a row of returned JSON array of objects in format given below. If value contains multiple data (eg. numbers) store it as separate items. Freely extend it when needed to not miss any data!\
                Include the type of this results in english (eg. "blood_results", "rmi") in "type" key of JSON and then more detailed type in "subtype" key.  \
                Summary the record to one nice sentence and put it under "title". Extract max 3 keywords (min 4 chars each) and put it in "tags" key including one tag equal to year of this record tags can not be personal data. \
                Include the language of the document inside "language" key.  If the result is single block of text please try additionaly to saving text result  \
                extract very detailed and all features from it and put it as an array under "findings" key. \n\r\n\rSecond: Fix all the original text issues and glitches. Please use markdown to format the nicely and return after JSON object, \
                wrap it with  ```markdown on start and  ``` on end of the text. Do not add to the text anything not explicitly existing in the source documents. \r\n\r\n: \r\n\r\n```json\r\n' +
                JSON.stringify(itemSchema) + '```\r\n\r\n Original text: ' + ocrText;
    }, // [ { type: "blood_results", subtype: "morphology", findings: [], ... }, {type: "mri", subtype: "head mri", ...}]

    recordRemovePII: (context: PromptContext, ocrText: string) => {
        return 'Please remove Personal Data (names, first names, last names, company names, emails, id numbers, phone numbers, addresses), fix language errors and format markdown from the text ' + ocrText
    },
    recordIntoChat: (context: PromptContext) => {
        return 'Below is my health result data in JSON format. Please describe the results in plain language. Note all exceptions from the norm and tell me what it could mean? Answer in the language of original document. Return text, no code. \r\n\r\n```json\
        \r\n' + JSON.stringify(context.record?.json) + '```'
    },
    recordIntoChatSimplified: (context: PromptContext) => {
        return 'Structured health record in JSON:  \r\n\r\n```json\
        \r\n' + JSON.stringify(context.record?.json) + '```'
    },
    translateRecord: (context: PromptContext & { language: string}) => {
        return 'Translate this health record to ' + context.language + ' language. Return translated JSON plus translated markdown: \r\n\r\n```json\
        '+ JSON.stringify(context.record?.json) + "```\r\n\r\n```markdown\r\n" + context.record?.text + '```';
    },
    translateRecordText: (context: PromptContext & { language: string}) => {
        return 'Translate this health record to ' + context.language + ' language: ' + context.record?.description + ' ' + context.record?.text;
    },
    recordSummary: (context: PromptContext) => {
        return 'Summarize the health result data below in one sentence: ' + context.record?.text
    },
    recordsToChat: (context: PromptContext) => {
        return 'OK. Now I will send you all my health records. Answer for now just with the number of records you received. Then I will ask more questions'
    },
    recordsToChatDone: (context: PromptContext & { records: Record[] }) => {
        return 'Health record context (' + context.records.length + ' records) sent.';
    },
    bestNextSteps: (context: PromptContext) => {
        return 'Based on the health result data below, what are the best next steps? What are the most important recommendations? '+ context.record?.text
    },
    recordInterpretation: (context: PromptContext) => {
        return 'Interpret the health result data below. What are the most important findings? What are the most important exceptions from the norm? What could they mean? What are the most important recommendations? Answer in the language of original document. Return text, no code. \r\n\r\n```json\
        \r\n' + JSON.stringify(context.record?.json) + '```'
    },
};