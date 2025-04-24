import crypto from 'crypto';

// Cache for public key
let cachedPublicKey = null;

// Generate RSA key pair
export async function generateKeyPair() {
    try {
        console.log('Generating key pair...');
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
        console.log('Key pair generated successfully');
        return keyPair;
    } catch (error) {
        console.error('Key pair generation error:', error);
        throw error;
    }
}

// Utility functions for encryption/decryption
export async function getPublicKey() {
    try {
        console.log('Fetching public key...');
        const response = await fetch('http://localhost:3002/api/public-key');
        
        if (!response.ok) {
            console.error('Failed to fetch public key:', response.status);
            throw new Error(`Failed to fetch public key: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Public key response received');
        
        if (!data.publicKey) {
            console.error('No public key in response');
            throw new Error('No public key received from server');
        }
        
        // Format the public key properly
        const formattedKey = `-----BEGIN PUBLIC KEY-----\n${data.publicKey}\n-----END PUBLIC KEY-----`;
        console.log('Public key formatted');
        
        return formattedKey;
    } catch (error) {
        console.error('Error in getPublicKey:', error);
        throw error;
    }
}

// Encrypt data with public key
export async function encryptWithPublicKey(publicKey, data) {
    try {
        console.log('Starting encryption...');
        console.log('Data to encrypt:', data);
        
        if (!publicKey) {
            throw new Error('Public key is required');
        }
        
        // Convert PEM to base64
        const publicKeyBase64 = publicKey
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\n/g, '')
            .trim();

        console.log('Public key formatted');
        
        // Import the public key
        const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');
        console.log('Public key converted to buffer');
        
        const publicKeyObj = await crypto.subtle.importKey(
            'spki',
            publicKeyBuffer,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            true,
            ['encrypt']
        );

        console.log('Public key imported');
        
        // Convert data to string and encode
        const dataString = JSON.stringify(data);
        console.log('Data stringified');
        
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(dataString);
        console.log('Data encoded');
        
        // Encrypt the data
        const encrypted = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKeyObj,
            encodedData
        );

        console.log('Data encrypted');
        
        // Convert to base64
        const encryptedBase64 = Buffer.from(encrypted).toString('base64');
        console.log('Encryption completed successfully');
        
        return encryptedBase64;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

// Decrypt data with private key
export async function decryptWithPrivateKey(privateKey, encryptedData) {
    try {
        console.log('Starting decryption...');
        const encryptedBuffer = Buffer.from(encryptedData, 'base64');
        
        const decrypted = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedBuffer
        );
        
        console.log('Decryption completed successfully');
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
} 