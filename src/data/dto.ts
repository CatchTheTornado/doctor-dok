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

export const keyDTOSchema = z.object({
  keyLocatorHash: z.string().min(64).max(64),
  keyHash: z.string().min(32),
  keyHashParams: z.string().min(1),
  databaseIdHash: z.string().min(64).max(64),
  encryptedMasterKey: z.string().min(1),
  acl: z.string().nullable(),
  extra: z.string().nullable(),
  expiryDate: z.string().nullable(),
  updatedAt: z.string().default(() => getCurrentTS()),
});

export const KeyDTOEncSettings: DTOEncryptionSettings =  { ecnryptedFields: [] }
export type KeyDTO = z.infer<typeof keyDTOSchema>;


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
  text: z.string().nullable(),
  json: z.string().optional().nullable(),
  extra: z.string().optional().nullable(),

  createdAt: z.string().default(() => getCurrentTS()),
  updatedAt: z.string().default(() => getCurrentTS()),

  // bc. we're using end 2 end encryption on the database level even JSON fields must be represented as string
  attachments: z.string().optional().nullable()
});

export const PatientRecordDTOEncSettings = { ecnryptedFields: ['description', 'type', 'json', 'extra', 'text', 'attachments'] }
export type PatientRecordDTO = z.infer<typeof patientRecordDTOSchema>;



export const databaseCreateRequestSchema = z.object({
  keyLocatorHash: z.string().min(64).max(64),
  keyHash: z.string().min(32),
  keyHashParams: z.string().min(1),
  databaseIdHash: z.string().min(1).min(64).max(64),
  encryptedMasterKey: z.string().min(1),
});
export type DatabaseCreateRequestDTO = z.infer<typeof databaseCreateRequestSchema>;


export const databaseAuthorizeChallengeRequestSchema = z.object({
  keyLocatorHash: z.string().min(64).max(64),
  databaseIdHash: z.string().min(1).min(64).max(64),
});
export type DatabaseAuthorizeChallengeRequestDTO = z.infer<typeof databaseAuthorizeChallengeRequestSchema>;

export const databaseAuthorizeRequestSchema = z.object({
  keyLocatorHash: z.string().min(64).max(64),
  keyHash: z.string().min(32),
  databaseIdHash: z.string().min(1).min(64).max(64),
});
export type DatabaseAuthorizeRequestDTO = z.infer<typeof databaseAuthorizeRequestSchema>;


  export const keyHashParamsDTOSchema = z.object({
    salt: z.string(),
    time: z.number().positive().int(),
    mem: z.number().positive().int(),
    hashLen: z.number().positive().int(),
    parallelism: z.number().positive().int(),
  });
  export type KeyHashParamsDTO = z.infer<typeof keyHashParamsDTOSchema>;
