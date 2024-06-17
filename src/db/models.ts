import { object, string, number, date, InferType } from 'yup';
import { getCurrentTS } from './server/db-provider';

export const patientSchema = object({
    id: number().positive().required(),
    firstName: string().required(),
    lastName: string().required(),
    updatedAt: string().default(() =>getCurrentTS()),
  });

export type Patient = InferType<typeof patientSchema>;

export const configSchema = object({
    key: string().required(),
    value: string().required(),
    updatedAt: string().default(getCurrentTS()),
  });
export type Config = InferType<typeof configSchema>;


export const patientRecordAttachmentSchema = object({
    id: number().positive().required(),
    patientId: number().positive().integer().required(),
    patientRecordId: number().positive().integer().required(),
  
    displayName: string().required(),
    description: string(),

    mimeType: string(),
    type: string(),
    json: string(),
    extra: string(),

    size: number().integer().positive(),
  
    createdAt: string().default(getCurrentTS()),
    updatedAt: string().default(getCurrentTS()),
  });
export type PatientRecordAttachment = InferType<typeof patientRecordAttachmentSchema>;


export const patientRecordSchema = object({
  id: number().positive().required(),
  patientId: number().positive().integer().required(),

  description: string(),
  type: string().required(),
  json: string(),
  extra: string(),

  createdAt: string().default(getCurrentTS()),
  updatedAt: string().default(getCurrentTS()),
});

export type PatientRecord = {
    id: number;
    patientId: number;
    type: string;

    description?: string;
    json?: string;
    extra?: string;

    createdAt: string;
    updatedAt: string;
    
    attachments?: PatientRecordAttachment[];
}