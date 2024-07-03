import { PatientDTO, PatientRecordDTO } from "../dto";


export enum DataLoadingStatus {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
}

export enum DataLinkStatus {
    Empty = 'Empty',
    AuthorizationError = 'AuthorizationError',
    Authorized = 'Success',
    InProgress = 'InProgress'
}

export class ServerDataLinkStatus {
    status: DataLinkStatus;
    message: string;
    constructor(status: DataLinkStatus, message: string) {
        this.status = status;
        this.message = message;
    }

    isReady(): boolean {
        return this.status === DataLinkStatus.Authorized;
    }

}

export class Patient {
    id?: number;
    firstName: string;
    lastName: string;
    email?: string;
    dateOfBirth?: string;
    updatedAt?: string;

    constructor(patientDTO: PatientDTO) {
        this.id = patientDTO.id;
        this.firstName = patientDTO.firstName;
        this.lastName = patientDTO.lastName;
        this.email = patientDTO.email;
        this.dateOfBirth = patientDTO.dateOfBirth;
        this.updatedAt = patientDTO.updatedAt;
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


export class PatientRecord {
    id?: number;
    patientId: number;
    description?: string;
    type: string;
    json?: string;
    extra?: string;
    createdAt: string;
    updatedAt: string;
  
    constructor(patientRecordDTO: PatientRecordDTO) {
      this.id = patientRecordDTO.id;
      this.patientId = patientRecordDTO.patientId;
      this.description = patientRecordDTO.description;
      this.type = patientRecordDTO.type;
      this.json = patientRecordDTO.json;
      this.extra = patientRecordDTO.extra;
      this.createdAt = patientRecordDTO.createdAt;
      this.updatedAt = patientRecordDTO.updatedAt;
    }
  
    static fromDTO(patientRecordDTO: PatientRecordDTO): PatientRecord {
      return new PatientRecord(patientRecordDTO);
    }
  
    toDTO(): PatientRecordDTO {
      return {
        id: this.id,
        patientId: this.patientId,
        description: this.description,
        type: this.type,
        json: this.json,
        extra: this.extra,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }  
  }