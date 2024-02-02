import { createCipheriv, createDecipheriv, } from 'crypto';
import pbkdf2Hmac from 'pbkdf2-hmac'

export async function getDerivedBytes(password: string, byteLength: number) {
    const str = await pbkdf2Hmac(
        password,
        Buffer.from(password, 'utf-8'),
        1000,
        byteLength,
        'SHA-1');
    return Buffer.from(str);
}

async function getAESKeyIV(password: string) {
    const derivedBytes = await getDerivedBytes(password, 48);
    const key = derivedBytes.slice(0, 32);
    const iv = derivedBytes.slice(32);
    return { key, iv };
}

export const encryptAES = async (
    text: string,
    password: string
): Promise<string> => {
    const { key, iv } = await getAESKeyIV(password);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const input = Buffer.from(text, 'utf16le');
    const encrypted = Buffer.concat([
        cipher.update(input),
        cipher.final(),
    ]);
    return encrypted.toString('base64');
};

export const decryptAES = async (
    encrypted: string,
    password: string
): Promise<string> => {
    const { key, iv } = await getAESKeyIV(password);
    const cipher = createDecipheriv('aes-256-cbc', key, iv);
    const input = Buffer.from(encrypted, 'base64');
    const decrypted = Buffer.concat([
        cipher.update(input),
        cipher.final(),
    ]);
    return decrypted.toString('utf16le');
};