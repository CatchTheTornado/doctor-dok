import * as CryptoJS from 'crypto-js';

export class EncryptionUtils {
  private key: CryptoJS.lib.WordArray;

  constructor(secretKey: string) {
    this.key = CryptoJS.enc.Utf8.parse(secretKey);
  }

  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  decrypt(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

export class DTOEncryptionFilter<T> {
    private utils: EncryptionUtils;
  
    constructor(secretKey: string) {
      this.utils = new EncryptionUtils(secretKey);
    }
  
    encrypt(dto: T): T {
      return this.process(dto, (value) => {
        if (typeof value === 'object') {
          return 'json-' + this.utils.encrypt(JSON.stringify(value));
        }
        return this.utils.encrypt(value);
      });
    }
  
    decrypt(dto: T): T {
      return this.process(dto, (value) => {
        if (value.startsWith('json-')) {
          return JSON.parse(this.utils.decrypt(value.slice(5)));
        }
        return this.utils.decrypt(value);
      });
    }
  
    private process(dto: T, processFn: (value: string) => string): T {
      const result = {} as T;
      for (const key in dto) {
        if (typeof dto[key] === 'string' || typeof dto[key] === 'object') {
          result[key] = processFn(dto[key] as unknown as string);
        } else {
          result[key] = dto[key];
        }
      }
      return result;
    }
  }