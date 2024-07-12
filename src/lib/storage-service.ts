import path from 'path'
import fs from 'fs'

export class StorageService {
    private rootPath: string;
    private uploadPath: string;

    constructor() {
        this.rootPath = path.resolve(process.cwd());
        this.uploadPath = path.resolve(this.rootPath, 'uploads');
    }

    public async saveAttachment(file: File, storageKey: string): Promise<void> {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        fs.writeFileSync(path.resolve(this.uploadPath, storageKey), buffer);
    }

    public readAttachment(storageKey: string): ArrayBuffer {
        const filePath = path.resolve(this.uploadPath, storageKey);
        const buffer = fs.readFileSync(filePath);
        return buffer.buffer;
    }
}
