
import { useEffect } from 'react';

// Component to set security headers via meta tags
const SecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.openai.com https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://bqixlrinahtauahcnpoc.supabase.co https://api.openai.com wss://bqixlrinahtauahcnpoc.supabase.co; font-src 'self' https://fonts.gstatic.com https: data:; frame-ancestors 'none';";
    document.head.appendChild(cspMeta);

    // X-Content-Type-Options
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    contentTypeMeta.content = 'nosniff';
    document.head.appendChild(contentTypeMeta);

    // X-Frame-Options
    const frameOptionsMeta = document.createElement('meta');
    frameOptionsMeta.httpEquiv = 'X-Frame-Options';
    frameOptionsMeta.content = 'DENY';
    document.head.appendChild(frameOptionsMeta);

    // X-XSS-Protection
    const xssProtectionMeta = document.createElement('meta');
    xssProtectionMeta.httpEquiv = 'X-XSS-Protection';
    xssProtectionMeta.content = '1; mode=block';
    document.head.appendChild(xssProtectionMeta);

    // Referrer Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.name = 'referrer';
    referrerMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerMeta);

    // Permissions Policy
    const permissionsMeta = document.createElement('meta');
    permissionsMeta.httpEquiv = 'Permissions-Policy';
    permissionsMeta.content = 'camera=(), microphone=(), geolocation=(), payment=()';
    document.head.appendChild(permissionsMeta);

    return () => {
      // Cleanup on unmount
      if (document.head.contains(cspMeta)) document.head.removeChild(cspMeta);
      if (document.head.contains(contentTypeMeta)) document.head.removeChild(contentTypeMeta);
      if (document.head.contains(frameOptionsMeta)) document.head.removeChild(frameOptionsMeta);
      if (document.head.contains(xssProtectionMeta)) document.head.removeChild(xssProtectionMeta);
      if (document.head.contains(referrerMeta)) document.head.removeChild(referrerMeta);
      if (document.head.contains(permissionsMeta)) document.head.removeChild(permissionsMeta);
    };
  }, []);

  return null;
};

export default SecurityHeaders;
