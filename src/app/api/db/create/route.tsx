import { KeyDTO, DatabaseCreateRequestDTO, databaseCreateRequestSchema } from "@/data/dto";
import { maintenance } from "@/data/server/db-provider";
import ServerKeyRepository from "@/data/server/server-key-repository";
import { getDatabaseId } from "@/lib/generic-api";
import { getCurrentTS, getErrorMessage, getZedErrorMessage } from "@/lib/utils";
import { Key } from "lucide-react";
import { NextRequest, userAgent } from "next/server";



// This is the UC01 implementation of https://github.com/CatchTheTornado/patient-pad/issues/65
export async function POST(request: NextRequest) {
    try {
        const validationResult = databaseCreateRequestSchema.safeParse(request.json()); // validation
        if (validationResult.success === true) {
            const authCreateRequest = validationResult.data;

            if (maintenance.checkIfDatabaseExists(authCreateRequest.databaseIdHash)) { // to not avoid overriding database fiels
                return {
                    message: 'Database already exists. Please select different Id.',
                    data: { 
                        databaseIdHash: authCreateRequest.databaseIdHash
                    },
                    status: 409
                };            
            } else {
                maintenance.createDatabaseManifest(authCreateRequest.databaseIdHash, {
                    databaseIdHash: authCreateRequest.databaseIdHash,
                    createdAt: getCurrentTS(),
                    creator: {
                        ip: request.ip,
                        ua: userAgent(request).ua,
                        geo: request.geo
                    }                
                });                
            }

            const keyRepo = new ServerKeyRepository(getDatabaseId(request)); // creating a first User Key
            keyRepo.create({
                keyLocatorHash: authCreateRequest.keyLocatorHash,
                keyHash: authCreateRequest.keyHash,
                keyHashParams: authCreateRequest.keyHashParams,
                encryptedMasterKey: authCreateRequest.encryptedMasterKey,
                databaseIdHash: authCreateRequest.databaseIdHash,                
                acl: null,
                extra: null,
                expiryDate: null,
                updatedAt: getCurrentTS(),
            })

            // check if db already exists - if so, return error

            return {
                message: 'Database created successfully. Now you can log in.',
                data: null,
                status: 200
            };
        } else {
            return {
                message: getZedErrorMessage(validationResult.error),
                issues: validationResult.error.issues,
                status: 400               
            };
        }
    } catch (e) {
        console.error(e);
        return {
            message: getErrorMessage(e),
            error: e,
            status: 500
        };
    }    

}
