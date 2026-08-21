import { LOCAL_IP } from '../services/api';

/**
 * Ensures image URLs (avatars, post images) are correctly formatted
 * with the machine's local IP address for React Native / Expo to load properly.
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  let trimmed = url.trim();
  if (!trimmed) return undefined;

  // Relative path starting with /
  if (trimmed.startsWith('/')) {
    return `http://${LOCAL_IP}:8081${trimmed}`;
  }

  // Handle localhost / 127.0.0.1 or hardcoded IPs with port
  return trimmed
    .replace(/http:\/\/localhost:\d+/g, `http://${LOCAL_IP}:8081`)
    .replace(/http:\/\/127\.0\.0\.1:\d+/g, `http://${LOCAL_IP}:8081`)
    .replace(/http:\/\/192\.168\.\d+\.\d+:\d+/g, `http://${LOCAL_IP}:8081`)
    .replace(/http:\/\/localhost/g, `http://${LOCAL_IP}:8081`)
    .replace(/http:\/\/127\.0\.0\.1/g, `http://${LOCAL_IP}:8081`);
}
