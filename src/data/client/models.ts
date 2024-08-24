import { EncryptedAttachmentDTO, KeyACLDTO, KeyDTO, PatientDTO, PatientRecordDTO } from "../dto";
import { z } from "zod";

import PasswordValidator from 'password-validator';
import { getCurrentTS } from "@/lib/utils";
import { sha256 } from "@/lib/crypto";


export enum DataLoadingStatus {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
}

export enum DatabaseAuthStatus {
    Empty = 'Empty',
    NotAuthorized = 'NotAuthorized',
    AuthorizationError = 'AuthorizationError',
    Authorized = 'Success',
    InProgress = 'InProgress'
}

export class Patient {
    id?: number;
    firstName: string;
    lastName: string;
    email?: string;
    dateOfBirth?: string;
    updatedAt?: string;
    json?: Record<string, any>;

    constructor(patientDTO: PatientDTO | Patient) {
        this.id = patientDTO.id;
        this.firstName = patientDTO.firstName;
        this.lastName = patientDTO.lastName;
        this.email = patientDTO.email;
        this.dateOfBirth = patientDTO.dateOfBirth;
        this.updatedAt = patientDTO.updatedAt;
        if (patientDTO instanceof Patient) {
            this.json = patientDTO.json;
        } else {
            this.json = patientDTO.json ? (typeof patientDTO.json === 'string' ? JSON.parse(patientDTO.json) : patientDTO.json) : null;
        }   
    }

    static fromDTO(patientDTO: PatientDTO): Patient {
        return new Patient(patientDTO);
    }    

    toDTO(): PatientDTO {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            dateOfBirth: this.dateOfBirth,
            updatedAt: this.updatedAt ? this.updatedAt : new Date().toISOString(),
            json: JSON.stringify(this.json),
        };
    }

    displayName(): string {
        return this.firstName + " " + this.lastName;
    }
    displatDateOfBirth(): string {
        return this.dateOfBirth ? new Date(this.dateOfBirth).toLocaleDateString() : '';
    }
    avatarFallback(): string {
        return (this.firstName[0] + this.lastName[0]).toUpperCase();
    }    
}

export type AttachmentAssigment = {
    id: number;
    type: string;
}

export type DisplayableDataObject =  {
    contentType?: string;
    url: string;
    name: string;
}

export class EncryptedAttachment {
    id?: number;
    assignedTo?: AttachmentAssigment[];
    displayName: string;
    description?: string;
    mimeType?: string;
    type?: string;
    json?: string;
    extra?: string;
    size: number;
    storageKey: string;
    createdAt: string;
    updatedAt: string;

    constructor(attachmentDTO: EncryptedAttachmentDTO) {
        this.id = attachmentDTO.id;
        this.assignedTo = attachmentDTO.assignedTo ? ( typeof attachmentDTO.assignedTo == 'string' ? JSON.parse(attachmentDTO.assignedTo) : attachmentDTO.assignedTo ): [];
        this.displayName = attachmentDTO.displayName;
        this.description = attachmentDTO.description ? attachmentDTO.description : '';
        this.mimeType = attachmentDTO.mimeType ? attachmentDTO.mimeType : '';
        this.type = attachmentDTO.type ? attachmentDTO.type : '';
        this.json = attachmentDTO.json ? attachmentDTO.json : '';
        this.extra = attachmentDTO.extra ? attachmentDTO.extra : '';
        this.size = attachmentDTO.size;
        this.storageKey = attachmentDTO.storageKey;
        this.createdAt = attachmentDTO.createdAt;
        this.updatedAt = attachmentDTO.updatedAt;
    }

    static fromDTO(fileDTO: EncryptedAttachmentDTO): EncryptedAttachment {
        return new EncryptedAttachment(fileDTO);
    }

    toDTO(): EncryptedAttachmentDTO {
        return {
            id: this.id,
            assignedTo: JSON.stringify(this.assignedTo),
            displayName: this.displayName,
            description: this.description,
            mimeType: this.mimeType,
            type: this.type,
            json: this.json,
            extra: this.extra,
            size: this.size,
            storageKey: this.storageKey,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export const patientRecordExtraSchema = z.object({
    type: z.string().min(1),
    value: z.string().min(1).or(z.array(z.string().min(1))).or(z.object({}))
});
export type PatientRecordExtra = z.infer<typeof patientRecordExtraSchema>;

export const patientRecordItemSchema = z.object({
    type: z.string().min(1),
    subtype: z.string().optional(),
    language: z.string().optional(),
    test_date: z.date().optional(),
    admission_date: z.date().optional(),
    discharge_date: z.date().optional(),
    conclusion: z.string().optional(),
    diagnosis: z.array(z.object({})).optional(),
    findings: z.array(z.object({
        name: z.string().optional(),
        value: z.string().optional(),
        unit: z.string().optional(),
        min: z.string().optional(),
        max: z.string().optional(),
    }).or(z.string())).optional()

  });
  
export type PatientRecordItem = z.infer<typeof patientRecordItemSchema>;


export class PatientRecord {
    id?: number;
    patientId: number;
    description?: string;
    type: string;
    json?: PatientRecordItem[] | null;
    text?: string;
    extra?: PatientRecordExtra[] | null;
    createdAt: string;
    updatedAt: string;
    attachments: EncryptedAttachment[] = [];

    parseInProgress: boolean = false;
    parseError: any = null;
  
    constructor(patientRecordSource: PatientRecordDTO | PatientRecord) {
      this.id = patientRecordSource.id;
      this.patientId = patientRecordSource.patientId;
      this.description = patientRecordSource.description;
      this.type = patientRecordSource.type;
      this.text = patientRecordSource.text ? patientRecordSource.text : '';
      if(patientRecordSource instanceof PatientRecord) {
        this.json = patientRecordSource.json
     } else {
        this.json = patientRecordSource.json ? (typeof patientRecordSource.json === 'string' ? JSON.parse(patientRecordSource.json) : patientRecordSource.json) : null;
     }

     if(patientRecordSource instanceof PatientRecord) {
        this.extra = patientRecordSource.extra
     } else {
        this.extra = patientRecordSource.extra ? (typeof patientRecordSource.extra === 'string' ? JSON.parse(patientRecordSource.extra) : patientRecordSource.extra) : null;
     }
      this.createdAt = patientRecordSource.createdAt;
      this.updatedAt = patientRecordSource.updatedAt;
      if(patientRecordSource instanceof PatientRecord) {
         this.attachments = patientRecordSource.attachments
      } else {
         this.attachments = patientRecordSource.attachments ? (typeof patientRecordSource.attachments === 'string' ? JSON.parse(patientRecordSource.attachments) : patientRecordSource.attachments).map(EncryptedAttachment.fromDTO) : [];
      }
    }
  
    static fromDTO(patientRecordDTO: PatientRecordDTO): PatientRecord {
      return new PatientRecord(patientRecordDTO);
    }

    async cacheKey(databaseHashId: string): Promise<string> {
        const attachmentsHash = await sha256(this.attachments.map(ea => ea.storageKey).join('-'), 'attachments')
        const cacheKey = `patientRecord-${this.id}-${attachmentsHash}-${databaseHashId}`;
        return cacheKey
    }
  
    toDTO(): PatientRecordDTO {
      return {
        id: this.id,
        patientId: this.patientId,
        description: this.description,
        type: this.type,
        json: JSON.stringify(this.json),
        text: this.text ? this.text : '',
        extra: JSON.stringify(this.extra),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        attachments: JSON.stringify(this.attachments.map(attachment => attachment.toDTO()))
      };
    }  
  }

export class KeyACL {
    role: string;
    features: string[];
    constructor(keyACLDTO: KeyACLDTO) {
        this.role = keyACLDTO.role;
        this.features = keyACLDTO.features;
    }

    static fromDTO(keyACLDTO: KeyACLDTO): KeyACL {
        return new KeyACL(keyACLDTO);
    }

    toDTO(): KeyACLDTO {
        return {
            role: this.role,
            features: this.features,
        };
    }

}

export class Key {
    displayName: string;
    keyLocatorHash: string;
    keyHash: string;
    keyHashParams: string;
    databaseIdHash: string;
    encryptedMasterKey: string;
    acl: KeyACL | null;
    extra: string | null;
    expiryDate: string | null;
    updatedAt: string;

    constructor(keyDTO: KeyDTO | Key) {
        this.displayName = keyDTO.displayName;
        this.keyLocatorHash = keyDTO.keyLocatorHash;
        this.keyHash = keyDTO.keyHash;
        this.keyHashParams = keyDTO.keyHashParams;
        this.databaseIdHash = keyDTO.databaseIdHash;
        this.encryptedMasterKey = keyDTO.encryptedMasterKey;
        this.acl = keyDTO instanceof Key ? keyDTO.acl :  (keyDTO.acl ? JSON.parse(keyDTO.acl) : null);
        this.extra = keyDTO.extra ?? null;
        this.expiryDate = keyDTO.expiryDate ?? null;
        this.updatedAt = keyDTO.updatedAt ?? getCurrentTS();
    }

    static fromDTO(keyDTO: KeyDTO): Key {
        return new Key(keyDTO);
    }

    toDTO(): KeyDTO {
        return {
            displayName: this.displayName,
            keyLocatorHash: this.keyLocatorHash,
            keyHash: this.keyHash,
            keyHashParams: this.keyHashParams,
            databaseIdHash: this.databaseIdHash,
            encryptedMasterKey: this.encryptedMasterKey,
            acl: JSON.stringify(this.acl),
            extra: this.extra,
            expiryDate: this.expiryDate,
            updatedAt: this.updatedAt,
        };
    }
}

export class DatabaseCreateRequest {
    databaseId: string;
    key: string;

    constructor(databaseId: string, key: string) {
        this.databaseId = databaseId;
        this.key = key;
    }
}


export class DatabaseKeepLoggedInRequest {
    encryptedDatabaseId: string;
    encryptedKey: string;
    keepLoggedIn: boolean;

    constructor(encryptedDatabaseId: string, encryptedKey: string, keepLoggedIn: boolean) {
        this.encryptedDatabaseId = encryptedDatabaseId;
        this.encryptedKey = encryptedKey;;
        this.keepLoggedIn = keepLoggedIn;
    }
}

export class DatabaseAuthorizeRequest {
    databaseId: string;
    key: string;
    keepLoggedIn: boolean;

    constructor(databaseId: string, key: string, keepLoggedIn: boolean) {
        this.databaseId = databaseId;
        this.key = key;
        this.keepLoggedIn = keepLoggedIn;
    }
}

export class DatabaseRefreshRequest {
    refreshToken: string;
    keepLoggedIn?: boolean;

    constructor(refreshToken: string, keepLoggedIn?: boolean) {
        this.refreshToken = refreshToken;
        this.keepLoggedIn = keepLoggedIn;
    }
}


export const databaseIdValidator = (value:string) => {
    const passSchema = new PasswordValidator();
    passSchema.is().min(6).has().not().spaces();
    return passSchema.validate(value);
    
}
export const userKeyValidator = (value:string) => {
    const passSchema = new PasswordValidator();
    passSchema.is().min(6).has().not().spaces();
    return passSchema.validate(value);
}

export const sharingKeyValidator = (value:string) => {
    const passSchema = new PasswordValidator();
    passSchema.is().min(6).has().not().spaces().has().digits(6);
    return passSchema.validate(value);
}