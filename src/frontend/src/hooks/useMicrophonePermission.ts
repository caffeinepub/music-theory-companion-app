import { useState, useEffect } from 'react';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

interface UseMicrophonePermissionReturn {
  permissionState: PermissionState;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
  isChecking: boolean;
}

const STORAGE_KEY = 'music-theory-mic-permission';

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');

  const checkPermission = async () => {
    try {
      // Check if the Permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionState(result.state as PermissionState);
        
        // Listen for permission changes
        result.onchange = () => {
          setPermissionState(result.state as PermissionState);
          if (result.state === 'granted') {
            localStorage.setItem(STORAGE_KEY, 'granted');
          } else if (result.state === 'denied') {
            localStorage.removeItem(STORAGE_KEY);
          }
        };
      } else {
        // Fallback: check localStorage for previous permission
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'granted') {
          setPermissionState('granted');
        } else {
          setPermissionState('prompt');
        }
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      // Fallback to prompt state
      setPermissionState('prompt');
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setPermissionState('checking');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just needed to trigger the permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      localStorage.setItem(STORAGE_KEY, 'granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionState('denied');
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    permissionState,
    requestPermission,
    hasPermission: permissionState === 'granted',
    isChecking: permissionState === 'checking',
  };
}
