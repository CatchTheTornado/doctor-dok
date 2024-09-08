import { DatabaseContextType } from "@/contexts/db-context";
import { AuditApiClient } from "@/data/client/audit-api-client";
import { AuditDTO } from "@/data/dto";
import { toast } from "sonner";

let apiClient:AuditApiClient|null = null;

export function auditLog(log: AuditDTO, dbContext: DatabaseContextType) {
    // Add your code here
    if (apiClient === null) {
        apiClient = new AuditApiClient('', dbContext, { secretKey: dbContext.masterKey, useEncryption: true });
    }

    apiClient.put(log).then((response) => {
        if (response.status === 200) {
            console.log('Audit log saved', log);
        } else {
            toast.error('Error saving audit log ' + response.message);
        }
    }).catch((error) => {
        console.error(error);
        toast.error('Error saving audit log', error);
    });
}