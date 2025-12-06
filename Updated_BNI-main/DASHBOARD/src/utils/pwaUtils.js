/**
 * PWA Utilities - Handle service worker registration, install prompts, and app updates
 */
import { registerSW } from 'virtual:pwa-register';

// ============================================
// PWA INSTALL PROMPT
// ============================================

let deferredPrompt = null;
let installPromptCallbacks = [];

export function setupInstallPrompt() {
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', event => {
    console.log('📱 Install prompt available');
    event.preventDefault();
    deferredPrompt = event;
    
    // Notify all registered callbacks
    installPromptCallbacks.forEach(callback => {
      callback(true); // PWA can be installed
    });
  });

  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    console.log('✅ App installed successfully');
    deferredPrompt = null;
    installPromptCallbacks.forEach(callback => {
      callback(false); // PWA already installed
    });
  });
}

export function isInstallPromptAvailable() {
  return deferredPrompt !== null;
}

export async function promptInstall() {
  if (!deferredPrompt) {
    console.log('⚠️ Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response to install prompt: ${outcome}`);
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

export function onInstallPromptAvailable(callback) {
  installPromptCallbacks.push(callback);
  // Return a function to allow unregistering the callback
  return () => {
    installPromptCallbacks = installPromptCallbacks.filter(cb => cb !== callback);
  };
}

// ============================================
// APP UPDATE HANDLING
// ============================================

// ============================================
// OFFLINE STATUS
// ============================================

let offlineStatusCallbacks = [];

export function setupOfflineDetection() {
  window.addEventListener('online', () => {
    console.log('📡 Application is online');
    offlineStatusCallbacks.forEach(callback => callback(true));
  });

  window.addEventListener('offline', () => {
    console.log('📡 Application is offline');
    offlineStatusCallbacks.forEach(callback => callback(false));
  });
}

export function isOnline() {
  return navigator.onLine;
}

export function onOfflineStatusChanged(callback) {
  offlineStatusCallbacks.push(callback);
}

// ============================================
// NOTIFICATION PERMISSION
// ============================================

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('⚠️ Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function canShowNotifications() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ============================================
// INITIALIZATION
// ============================================

export function initializePWA() {
    console.log('🚀 Initializing PWA features...');

    // Register the service worker using vite-plugin-pwa
    const updateSW = registerSW({
        onNeedRefresh() {
            // if (confirm('New content available. Do you want to reload?')) {
            //     updateSW(true);
            // }
        },
        onOfflineReady() {
            console.log('App is ready to work offline.');
        },
    });

    // Setup install prompt, update listener, and offline detection
    setupInstallPrompt();
    setupOfflineDetection();

    console.log('✅ PWA initialization complete');
}

export default {
  setupInstallPrompt,
  isInstallPromptAvailable,
  promptInstall,
  onInstallPromptAvailable,
  setupOfflineDetection,
  isOnline,
  onOfflineStatusChanged,
  requestNotificationPermission,
  canShowNotifications,
  initializePWA
};
