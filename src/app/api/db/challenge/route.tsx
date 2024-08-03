import { databaseAuthorizeChallengeRequestSchema, keyHashParamsDTOSchema, KeyDTO } from "@/data/dto";
import ServerKeyRepository from "@/data/server/server-key-repository";
import { getErrorMessage, getZedErrorMessage } from "@/lib/utils";



// clear all the database
export async function POST(request: Request) {
    try {
        const jsonRequest = await request.json();
        console.log(jsonRequest);
        const validationResult = databaseAuthorizeChallengeRequestSchema.safeParse(jsonRequest); // validation
        if (validationResult.success === true) {
            const authChallengeRequest = validationResult.data;
            const keyRepo = new ServerKeyRepository(authChallengeRequest.databaseIdHash); // get the user key
            const existingKeys = await keyRepo.findAll({  filter: { keyLocatorHash: authChallengeRequest.keyLocatorHash } }); // check if key already exists

            if(existingKeys.length === 0) { // this situation theoretically should not happen bc. if database file exists we return out of the function
                return Response.json({
                    message: 'Invalid Database Id or Key. Key not found.',
                    status: 401               
                });                    
            } else {
                const khpdValidation = keyHashParamsDTOSchema.safeParse(JSON.parse(existingKeys[0].keyHashParams))
                if (!khpdValidation.success) {
                    console.error(khpdValidation);
                    return Response.json({
                        message: getZedErrorMessage(khpdValidation.error),
                        issues: khpdValidation.error.issues,
                        status: 400               
                    });  
                } else {
                    const keyHashParamsObject = khpdValidation.data
                    return Response.json({
                        message: 'Key found. Challenge is ready.',
                        data: keyHashParamsObject,
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
