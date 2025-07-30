// Utilitários para detecção de dispositivos e capacidades de storage

export interface DeviceInfo {
  isIOS: boolean;
  isSafari: boolean;
  isMobile: boolean;
  storageAvailable: boolean;
  cookiesEnabled: boolean;
}

// Detecta se é dispositivo iOS
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detecta se é Safari
export const isSafari = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('firefox');
};

// Detecta se é dispositivo móvel
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Testa se localStorage está disponível
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Testa se sessionStorage está disponível
export const isSessionStorageAvailable = (): boolean => {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Testa se cookies estão habilitados
export const areCookiesEnabled = (): boolean => {
  try {
    document.cookie = 'testcookie=1; SameSite=Strict';
    const cookieEnabled = document.cookie.indexOf('testcookie=') !== -1;
    document.cookie = 'testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    return cookieEnabled;
  } catch {
    return false;
  }
};

// Obtém informações completas do dispositivo
export const getDeviceInfo = (): DeviceInfo => {
  return {
    isIOS: isIOSDevice(),
    isSafari: isSafari(),
    isMobile: isMobileDevice(),
    storageAvailable: isLocalStorageAvailable(),
    cookiesEnabled: areCookiesEnabled()
  };
};

// Log das informações do dispositivo para debug
export const logDeviceInfo = (): void => {
  const deviceInfo = getDeviceInfo();
  console.log('Device Info:', {
    ...deviceInfo,
    userAgent: navigator.userAgent,
    platform: navigator.platform
  });
};