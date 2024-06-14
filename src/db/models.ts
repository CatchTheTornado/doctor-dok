export type Patient = {
    id: number;
    firstName: string;
    lastName: string;
    updatedAt: string;
}

export type Config = {
    key: string;
    value: string;
    updatedAt: string;
}

export type HealthRecordAttachment = {

    id: number;

    healthRecordId: number;
    patientId: number;

    displayName: string;
    type: string;
    url: string;
    mimeType: string;
    size: number;

    description: string;
    json?: string;
    extra?: string;    

    createdAt: string;
    updatedAt: string;
}

export type HealthRecord = {
    id: number;
    patientId: number;

    description: string;
    type: string;
    json?: string;
    extra?: string;

    createdAt: string;
    updatedAt: string;
    
    attachments?: HealthRecordAttachment[];
}