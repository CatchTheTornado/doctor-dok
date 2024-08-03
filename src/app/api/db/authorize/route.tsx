import { databaseAuthorizeRequestSchema, KeyDTO } from "@/data/dto";
import { authorizeKey } from "@/data/server/server-key-helpers";
import { getErrorMessage, getZedErrorMessage } from "@/lib/utils";
import jwt from 'jsonwebtoken';

// clear all the database
export async function POST(request: Request) {
    try {
        const jsonRequest = await request.json();
        console.log(jsonRequest);
        const validationResult = databaseAuthorizeRequestSchema.safeParse(jsonRequest); // validation
        if (validationResult.success === true) {
            const authRequest = validationResult.data;
            const keyDetails = await authorizeKey(authRequest);

            if (!keyDetails) { // this situation theoretically should not happen bc. if database file exists we return out of the function
                return Response.json({
                    message: 'Invalid Database Id or Key. Key not found.',
                    status: 401               
                });                    
            } else {
                return Response.json({
                    message: 'Succesfully Authorized!',
                    data: {
                        encryptedMasterKey: (keyDetails as KeyDTO).encryptedMasterKey,
                        accessToken: jwt.sign({ databaseIdHash: authRequest.databaseIdHash, keyHash: authRequest.keyHash, keyLocatorHash: authRequest.keyLocatorHash }, process.env.PATIENT_PAD_TOKEN_SECRET || 'Jeipho7ahchue4ahhohsoo3jahmui6Ap' , { expiresIn: '10m' }),
                        refreshToken: jwt.sign({ databaseIdHash: authRequest.databaseIdHash, keyHash: authRequest.keyHash, keyLocatorHash: authRequest.keyLocatorHash },  process.env.PATIENT_PAD_REFRESH_TOKEN_SECRET || 'Am2haivu9teiseejai5Ao6engae8hiuw', { expiresIn: '3h' })
                    },
                    status: 200
                });                    
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
