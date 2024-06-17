import { subtle } from 'crypto';

/**
 * Encrypts data using the AES algorithm.
 * @param data - The data to be encrypted.
 * @param key - The encryption key.
 * @returns A promise that resolves to the encrypted data as an ArrayBuffer.
 */
export async function encrypt(data: ArrayBuffer, key: string): Promise<ArrayBuffer> {
    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const secretKey = await crypto.subtle.importKey('raw', Buffer.from(key, 'base64'), {
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);

    // Encrypt the data using AES-CBC algorithm
    const encryptedData = await subtle.encrypt(
        {
            name: 'AES-CBC',
            iv,
        },
        secretKey,
        data
    );

    // Concatenate the IV and encrypted data
    const encryptedDataWithIV = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    encryptedDataWithIV.set(new Uint8Array(iv), 0);
    encryptedDataWithIV.set(new Uint8Array(encryptedData), iv.byteLength);

    return encryptedDataWithIV.buffer;
}

/**
 * Decrypts data using the AES algorithm.
 * @param encryptedData - The encrypted data to be decrypted.
 * @param key - The encryption key.
 * @returns A promise that resolves to the decrypted data as an ArrayBuffer.
 */
export async function decrypt(encryptedData: ArrayBuffer, key: string): Promise<ArrayBuffer> {
    // Extract the IV from the encrypted data
    const iv = encryptedData.slice(0, 16);

    // Extract the encrypted data (excluding the IV)
    const data = encryptedData.slice(16);
    const secretKey = await crypto.subtle.importKey('raw', Buffer.from(key, 'base64'), {
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);

    // Decrypt the data using AES-CBC algorithm
    const decryptedData = await subtle.decrypt(
        {
            name: 'AES-CBC',
            iv,
        },
        secretKey,
        data
    );

    return decryptedData;
}

/**
 * Generates a random encryption key.
 * @returns The encryption key as a base64-encoded string.
 */
export function generateEncryptionKey(): string {
    const key = Buffer.from(
        crypto.getRandomValues(new Uint8Array(32))
      ).toString('base64');

    return key;
}

/**
 * Encrypts the string values in the given object using the specified key.
 * Only string values are encrypted, other types are left unchanged.
 *
 * @param dto - The object containing the values to be encrypted.
 * @param key - The encryption key to be used.
 * @returns The object with encrypted string values.
 */
export async function shallowEncryptDTO(dto: any, key: string): any {
    let k: keyof typeof dto; 
    for (k in dto) {
        if(typeof dto[k] === 'string') dto[k] = await encrypt(dto[k], key);
    }    
    console.log(dto);
    return dto
}