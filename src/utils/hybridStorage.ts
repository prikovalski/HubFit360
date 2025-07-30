// Sistema de storage híbrido para fallback em iOS/Safari

import { isLocalStorageAvailable, isSessionStorageAvailable, areCookiesEnabled } from './deviceDetection';

interface StorageOptions {
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
}

export class HybridStorage {
  private storageAvailable: boolean;
  private cookiesAvailable: boolean;
  private options: StorageOptions;

  constructor(options: StorageOptions = {}) {
    this.storageAvailable = isLocalStorageAvailable();
    this.cookiesAvailable = areCookiesEnabled();
    this.options = {
      // Não definir domain explicitamente para iOS Safari
      domain: undefined,
      path: options.path || '/',
      // Configurar para cross-site requests no iOS
      secure: true,
      sameSite: 'None',
      maxAge: options.maxAge || 365 * 24 * 60 * 60 // 1 ano
    };

    console.log('HybridStorage initialized:', {
      storageAvailable: this.storageAvailable,
      cookiesAvailable: this.cookiesAvailable,
      options: this.options
    });
  }

  // Definir item no storage
  setItem(key: string, value: string): boolean {
    try {
      // Tentar localStorage primeiro
      if (this.storageAvailable) {
        localStorage.setItem(key, value);
        console.log(`Stored in localStorage: ${key}`);
        return true;
      }
      
      // Fallback para cookies
      if (this.cookiesAvailable) {
        this.setCookie(key, value);
        console.log(`Stored in cookie: ${key}`);
        return true;
      }
      
      console.warn(`Unable to store ${key}: no storage available`);
      return false;
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      
      // Tentar cookies como último recurso
      if (this.cookiesAvailable) {
        try {
          this.setCookie(key, value);
          return true;
        } catch (cookieError) {
          console.error(`Cookie fallback failed for ${key}:`, cookieError);
        }
      }
      
      return false;
    }
  }

  // Obter item do storage
  getItem(key: string): string | null {
    try {
      // Tentar localStorage primeiro
      if (this.storageAvailable) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          return value;
        }
      }
      
      // Fallback para cookies
      if (this.cookiesAvailable) {
        return this.getCookie(key);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      
      // Tentar cookies como último recurso
      if (this.cookiesAvailable) {
        try {
          return this.getCookie(key);
        } catch (cookieError) {
          console.error(`Cookie fallback failed for ${key}:`, cookieError);
        }
      }
      
      return null;
    }
  }

  // Remover item do storage
  removeItem(key: string): boolean {
    let success = false;
    
    try {
      // Remover de localStorage
      if (this.storageAvailable) {
        localStorage.removeItem(key);
        success = true;
      }
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
    
    try {
      // Remover de cookies
      if (this.cookiesAvailable) {
        this.deleteCookie(key);
        success = true;
      }
    } catch (error) {
      console.error(`Error removing ${key} from cookies:`, error);
    }
    
    return success;
  }

  // Limpar todo o storage
  clear(): boolean {
    let success = false;
    
    try {
      if (this.storageAvailable) {
        localStorage.clear();
        success = true;
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    try {
      if (this.cookiesAvailable) {
        this.clearCookies();
        success = true;
      }
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
    
    return success;
  }

  // Métodos auxiliares para cookies
  private setCookie(name: string, value: string): void {
    const { domain, path, secure, sameSite, maxAge } = this.options;
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `; path=${path}`;
    cookieString += `; max-age=${maxAge}`;
    cookieString += `; SameSite=${sameSite}`;
    
    if (secure) {
      cookieString += '; Secure';
    }
    
    // Só adicionar domain se explicitamente definido (não para iOS)
    if (domain && !domain.includes('localhost') && !domain.includes('127.0.0.1')) {
      cookieString += `; domain=${domain}`;
    }
    
    document.cookie = cookieString;
    console.log(`Cookie set: ${name}`, { cookieString });
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    
    return null;
  }

  private deleteCookie(name: string): void {
    const { domain, path } = this.options;
    
    // Deletar com path atual
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    
    // Deletar com domain se não for localhost
    if (domain && !domain.includes('localhost') && !domain.includes('127.0.0.1')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
    }
    
    // Deletar com path raiz também
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  private clearCookies(): void {
    // Limpar cookies relacionados ao Supabase
    const supabaseCookies = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ];
    
    supabaseCookies.forEach(cookieName => {
      this.deleteCookie(cookieName);
    });
  }
}

// Instância global do hybrid storage
export const hybridStorage = new HybridStorage();