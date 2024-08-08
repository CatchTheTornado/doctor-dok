import { DatabaseAuthorizeRequestDTO, KeyDTO } from "../dto";
import ServerKeyRepository from "./server-key-repository";

export async function authorizeKey(authRequest: DatabaseAuthorizeRequestDTO): Promise<KeyDTO | boolean> {
    const keyRepo = new ServerKeyRepository(authRequest.databaseIdHash); // get the user key
    const existingKeys:KeyDTO[] = await keyRepo.findAll({  filter: { keyLocatorHash: authRequest.keyLocatorHash } }); // check if key already exists

    if(existingKeys.length === 0) { // this situation theoretically should not happen bc. if database file exists we return out of the function
        return false;      
    } else {
        const isExpired = existingKeys[0].expiryDate ? (new Date(existingKeys[0].expiryDate)).getTime() < Date.now() : false;
        if (existingKeys[0].keyHash !== authRequest.keyHash || isExpired) {    
            return false;
        } else {
            return existingKeys[0];
        }
    }
}