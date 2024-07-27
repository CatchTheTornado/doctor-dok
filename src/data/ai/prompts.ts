import { ConfigContextType } from "@/contexts/config-context";
import { PatientRecord, patientRecordItemSchema } from "../client/models";
import { zodToJsonSchema } from "zod-to-json-schema";

type PromptContext = {
    record?: PatientRecord;
    config?: ConfigContextType | null;
}

const itemSchema = zodToJsonSchema(patientRecordItemSchema);

export const prompts = {
    patientRecordParse: (context: PromptContext) => {
        return 'This is my health result data. Please parse it to JSON array of records including all findings, records, details, tests results, medications, diagnosis and others. \
                First: JSON should be all in original language. \
                Each medical record should a row of returned JSON array of objects in format given below. If value contains multiple data (eg. numbers) store it as separate items. Freely extend it when needed to not miss any data!\
                Include the type of this results in english (eg. "blood_results", "rmi") in "type" key of JSON and then more detailed type in "subtype" key.  \
                Include the language of the document inside "language" key.  If the result is single block of text please try additionaly to saving text result  \
                extract very detailed and all features from it and put it as an array under "findings" key. Second: Markdown text - please do kind of OCR - so convert all the \
                attachments to text. Please use markdown to format it nicely and return after JSON object, \
                wrap it with  ```markdown on start and  ``` on end of the text. Do not add to the text anything not explicitly existing in the source documents. \r\n\r\n: \r\n\r\n```json\r\n \
                ' + JSON.stringify(itemSchema) + '```\r\n\r\n'
    }, // [ { type: "blood_results", subtype: "morphology", findings: [], ... }, {type: "mri", subtype: "head mri", ...}]
    patientRecordIntoChat: (context: PromptContext) => {
        return 'Below is my health result data in JSON format. Please describe the results in plain language. Note all exceptions from the norm and tell me what it could mean? Answer in the language of original document. Return text, no code. \r\n\r\n```json\
        \r\n' + JSON.stringify(context.record?.json) + '```'
    } 
};