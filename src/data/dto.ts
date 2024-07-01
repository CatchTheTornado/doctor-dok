import { z } from 'zod';
import { getCurrentTS } from "@/lib/utils";

export type DTOEncryptionSettings = {
  ecnryptedFields: string[]
}

export const patientDTOSchema = z.object({
  id: z.number().positive().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().optional(),
  dateOfBirth: z.string().optional(),
  updatedAt: z.string().default(() => getCurrentTS()),
});

export const PatientDTOEncSettings: DTOEncryptionSettings =  { ecnryptedFields: ['firstName', 'lastName', 'dateOfBirth', 'email'] }
export type PatientDTO = z.infer<typeof patientDTOSchema>;

export const configDTOSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  updatedAt: z.string().default(() => getCurrentTS()),
});

export const ConfigDTOEncSettings: DTOEncryptionSettings =  { ecnryptedFields: ['value'] }
export type ConfigDTO = z.infer<typeof configDTOSchema>;

export const patientRecordAttachmentDTOSchema = z.object({
  id: z.number().positive().optional(),
  patientId: z.number().positive().int(),
  patientRecordId: z.number().positive().int(),

  displayName: z.string().min(1),
  description: z.string().optional(),

  mimeType: z.string().optional(),
  type: z.string().optional(),
  json: z.string().optional(),
  extra: z.string().optional(),

  size: z.number().positive().int(),
  storageKey: z.string().min(1),

  createdAt: z.string().default(() => getCurrentTS()),
  updatedAt: z.string().default(() => getCurrentTS()),
});

export type PatientRecordAttachmentDTO = z.infer<typeof patientRecordAttachmentDTOSchema>;

export const patientRecordDTOSchema = z.object({
  id: z.number().positive().optional(),
  patientId: z.number().positive().int(),

  description: z.string().optional(),
  type: z.string().min(1),
  json: z.string().optional(),
  extra: z.string().optional(),

  createdAt: z.string().default(() => getCurrentTS()),
  updatedAt: z.string().default(() => getCurrentTS()),
});

export type PatientRecordDTO = z.infer<typeof patientRecordDTOSchema> & {
  attachments?: PatientRecordAttachmentDTO[];
};
