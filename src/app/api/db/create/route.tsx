import { KeyDTO, DatabaseCreateRequestDTO, databaseCreateRequestSchema } from "@/data/dto";
import { maintenance } from "@/data/server/db-provider";
import ServerFolderRepository from "@/data/server/server-folder-repository";
import ServerKeyRepository from "@/data/server/server-key-repository";
import { authorizeSaasContext } from "@/lib/generic-api";
import { getCurrentTS, getErrorMessage, getZedErrorMessage } from "@/lib/utils";
import { NextRequest, userAgent } from "next/server";
import { features } from "process";



// This is the UC01 implementation of https://github.com/CatchTheTornado/doctor-dok/issues/65
export async function POST(request: NextRequest) {
    try {
        const jsonRequest = await request.json();
        const saasContext = await authorizeSaasContext(request); // authorize SaaS context
        if (!saasContext.hasAccess) {
            return Response.json({
                message: saasContext.error,
                status: 403
            });
        }

        if (saasContext.isSaasMode) {
            if (saasContext.saasContex?.currentQuota) {
                if(saasContext.saasContex?.currentQuota.allowedDatabases <= saasContext.saasContex?.currentUsage.usedDatabases) {
                    return Response.json({
                        message: 'You have reached the limit of databases you can create. Please upgrade your plan.',
                        status: 403
                    });
                }
            }
        }


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
                const folderRepo = new ServerFolderRepository(authCreateRequest.databaseIdHash); // creating a first User Key                     
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
                        displayName: '',
                        keyLocatorHash: authCreateRequest.keyLocatorHash,
                        keyHash: authCreateRequest.keyHash,
                        keyHashParams: authCreateRequest.keyHashParams,
                        encryptedMasterKey: authCreateRequest.encryptedMasterKey,
                        databaseIdHash: authCreateRequest.databaseIdHash,                
                        acl: JSON.stringify({
                            role: 'owner',
                            features: ['*']
                        }),
                        extra: null,
                        expiryDate: null,
                        updatedAt: getCurrentTS(),
                    })

                    const firstFolder = folderRepo.create({
                        name: 'General',
                        json: JSON.stringify({
                            name: 'root',
                            type: 'folder',
                            children: []
                        }),
                        updatedAt: getCurrentTS()
                    });

                    if (saasContext.isSaasMode) {
                        try {
                            saasContext.apiClient?.newDatabase({
                                databaseIdHash: authCreateRequest.databaseIdHash,
                                createdAt: getCurrentTS()
                            })
                        } catch (e) {
                            console.log(e)
                        }
                    }

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
