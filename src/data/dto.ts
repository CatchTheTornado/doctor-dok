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

export type AttachmentAssigmentDTO = {
  id: number;
  type: string;
}

export const EncryptedAttachmentDTOSchema = z.object({
  id: z.number().positive().optional(),
  displayName: z.string().min(1),
  description: z.string().optional().nullable(),

  mimeType: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  json: z.string().optional().nullable(),
  extra: z.string().optional().nullable(),

  size: z.number().positive().int(),
  storageKey: z.string().min(1),

  createdAt: z.string().default(() => getCurrentTS()),
  updatedAt: z.string().default(() => getCurrentTS()),

  // bc. we're using end 2 end encryption on the database level even JSON fields must be represented as string
  assignedTo: z.string().optional().nullable()
});
export const EncryptedAttachmentDTOEncSettings = { ecnryptedFields: ['displayName', 'description', 'mimeType', 'type', 'json', 'extra'] };
export type EncryptedAttachmentDTO = z.infer<typeof EncryptedAttachmentDTOSchema>;

export const patientRecordDTOSchema = z.object({
  id: z.number().positive().optional(),
  patientId: z.number().positive().int(),

  description: z.string().optional(),
  type: z.string().min(1),
  json: z.string().optional(),
  extra: z.string().optional(),

  createdAt: z.string().default(() => getCurrentTS()),
  updatedAt: z.string().default(() => getCurrentTS()),

  // bc. we're using end 2 end encryption on the database level even JSON fields must be represented as string
  attachments: z.string().optional().nullable()
});

export const PatientRecordDTOEncSettings = { ecnryptedFields: ['description', 'type', 'json', 'extra', 'attachments'] }
export type PatientRecordDTO = z.infer<typeof patientRecordDTOSchema>;
