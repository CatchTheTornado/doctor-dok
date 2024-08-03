import { KeyDTO, DatabaseCreateRequestDTO, databaseCreateRequestSchema } from "@/data/dto";
import { maintenance } from "@/data/server/db-provider";
import ServerKeyRepository from "@/data/server/server-key-repository";
import { authorizeDatabaseIdHash } from "@/lib/generic-api";
import { getCurrentTS, getErrorMessage, getZedErrorMessage } from "@/lib/utils";
import { Key } from "lucide-react";
import { NextRequest, userAgent } from "next/server";



// This is the UC01 implementation of https://github.com/CatchTheTornado/patient-pad/issues/65
export async function POST(request: NextRequest) {
    try {
        const jsonRequest = await request.json();
        console.log(jsonRequest);
        const validationResult = databaseCreateRequestSchema.safeParse(jsonRequest); // validation
        if (validationResult.success === true) {
            const authCreateRequest = validationResult.data;

            if (maintenance.checkIfDatabaseExists(authCreateRequest.databaseIdHash)) { // to not avoid overriding database fiels
                return Response.json({
                    message: 'Database already exists. Please select different Id.',
                    data: { 
                        databaseIdHash: authCreateRequest.databaseIdHash
                    },
                    status: 409
                });            
            } else {
                await maintenance.createDatabaseManifest(authCreateRequest.databaseIdHash, {
                    databaseIdHash: authCreateRequest.databaseIdHash,
                    createdAt: getCurrentTS(),
                    creator: {
                        ip: request.ip,
                        ua: userAgent(request).ua,
                        geo: request.geo
                    }                
                });                     
                const keyRepo = new ServerKeyRepository(authCreateRequest.databaseIdHash); // creating a first User Key
                const existingKeys = await keyRepo.findAll({  filter: { databaseIdHash: authCreateRequest.databaseIdHash } }); // check if key already exists

                if(existingKeys.length > 0) { // this situation theoretically should not happen bc. if database file exists we return out of the function
                    return Response.json({
                        message: 'User key already exists. Please select different Id.',
                        data: { 
                            databaseIdHash: authCreateRequest.databaseIdHash
                        },
                        status: 409               
                    });                    
                } else {
                    const firstUserKey = keyRepo.create({
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
                    // TODO: authorize + return access key (?)

                    return Response.json({
                        message: 'Database created successfully. Now you can log in.',
                        data: null,
                        status: 200
                    });                    
                }         
            }
        } else {
            console.error(validationResult);
            return Response.json({
                message: getZedErrorMessage(validationResult.error),
                issues: validationResult.error.issues,
                status: 400               
            });
        }
    } catch (e) {
        console.error(e);
        return Response.json({
            message: getErrorMessage(e),
            error: e,
            status: 500
        });
    }    

}
