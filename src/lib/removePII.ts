export function removePII(text: string, removeList: string[] = [], replaceString: string = '***'): string {
    // Create a regular expression pattern to match the PII
    const piiPattern = new RegExp(removeList.join('|'), 'gi');

    // Replace the PII with the replaceString
    const sanitizedText = text.replace(piiPattern, replaceString);

    return sanitizedText;
}