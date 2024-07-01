
export class EncryptionUtils {
  private key: CryptoKey = {} as CryptoKey;
  private secretKey: string;
  
  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async generateKey(secretKey: string): Promise<void> {
    const encoder = new TextEncoder();
    const keyData = await this.deriveKey(secretKey);
    this.key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async deriveKey(secretKey: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const salt = encoder.encode('someSalt'); // Replace 'someSalt' with a suitable salt value
    const iterations = 100000; // Adjust the number of iterations as needed
    const keyLength = 256; // 256 bits (32 bytes)
    const derivedKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    return crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      derivedKey,
      keyLength
    );
  }

  async encrypt(text: string): Promise<string> {
    await this.generateKey(this.secretKey);

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      this.key,
      data
    );
    const encryptedArray = Array.from(new Uint8Array(encryptedData));
    const encryptedHex = encryptedArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    const ivHex = Array.from(iv).map(byte => byte.toString(16).padStart(2, '0')).join('');
    return ivHex + encryptedHex;
  }

  async decrypt(cipherText: string): Promise<string> {
    try {
      await this.generateKey(this.secretKey);

      const ivHex = cipherText.slice(0, 32);
      const encryptedHex = cipherText.slice(32);
      const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        this.key,
        encryptedArray
      );
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (e) {
      console.error('Error decoding: ' + cipherText, e);
      return cipherText; // probably the text was not encrypted on in bat ivHex/encryptedHex format
    }
  }
}

export function generateEncryptionKey() {
  const key = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...key))
}

export class DTOEncryptionFilter<T> {
    private utils: EncryptionUtils;
  
    constructor(secretKey: string) {
      this.utils = new EncryptionUtils(secretKey);
    }
  
    async encrypt(dto: T): Promise<T> {
      return this.process(dto, async (value) => {
        if (typeof value === 'object') {
          return 'json-' + await this.utils.encrypt(JSON.stringify(value));
        }
        return await this.utils.encrypt(value);
      });
    }
    
    async decrypt(dto: T): Promise<T> {
      return this.process(dto, async (value) => {
        if (typeof value === 'string' && value.startsWith('json-')) {
          return JSON.parse(await this.utils.decrypt(value.slice(5)));
        }
        return await this.utils.decrypt(value);
      });
    }
  
    private async process(dto: T, processFn: (value: string) => Promise<string>): T {
      const result = {} as T;
      for (const key in dto) {
        if (typeof dto[key] === 'string' || typeof dto[key] === 'object') {
          result[key] = await processFn(dto[key] as string);
        } else {
          result[key] = dto[key];
        }
      }
      return result;
    }
  }

  