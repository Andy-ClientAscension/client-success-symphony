/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive data
 */

// Simple encryption utility for client-side data
// Note: This is for basic obfuscation, not cryptographic security
class SecureStorage {
  private readonly encryptionKey = 'app-storage-key-2024';

  private simpleEncrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    return btoa(result);
  }

  private simpleDecrypt(encrypted: string): string {
    try {
      const text = atob(encrypted);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        result += String.fromCharCode(char ^ keyChar);
      }
      return result;
    } catch {
      return '';
    }
  }

  setItem<T>(key: string, value: T, encrypt = false): void {
    try {
      const stringValue = JSON.stringify(value);
      const finalValue = encrypt ? this.simpleEncrypt(stringValue) : stringValue;
      localStorage.setItem(key, finalValue);
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  }

  getItem<T>(key: string, encrypted = false): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const decrypted = encrypted ? this.simpleDecrypt(item) : item;
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  // Secure methods for sensitive data
  setSecureItem<T>(key: string, value: T): void {
    this.setItem(key, value, true);
  }

  getSecureItem<T>(key: string): T | null {
    return this.getItem<T>(key, true);
  }

  // Session storage variants
  setSessionItem<T>(key: string, value: T, encrypt = false): void {
    try {
      const stringValue = JSON.stringify(value);
      const finalValue = encrypt ? this.simpleEncrypt(stringValue) : stringValue;
      sessionStorage.setItem(key, finalValue);
    } catch (error) {
      console.error('Failed to store session item:', error);
    }
  }

  getSessionItem<T>(key: string, encrypted = false): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const decrypted = encrypted ? this.simpleDecrypt(item) : item;
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve session item:', error);
      return null;
    }
  }
}

export const secureStorage = new SecureStorage();