/**
 * PWA Utilities - Handle service worker registration, install prompts, and app updates
 */

// NOTE: removed `workbox-window` import to avoid module 404s in dev
// If you prefer Workbox features, install `workbox-window` and re-enable the import.

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('❌ Service Workers not supported');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('✅ Service Worker registered:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

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
}

// ============================================
// APP UPDATE HANDLING
// ============================================

let updateCallbacks = [];

export async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return null;
    }

    const updateCheck = await registration.update();
    return updateCheck;
  } catch (error) {
    console.error('❌ Update check failed:', error);
    return null;
  }
}

export function setupUpdateListener() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
    // Listen for controllerchange (new SW has taken control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 New service worker activated - app updated');
      updateCallbacks.forEach(callback => callback());
    });

    // Check existing registration for waiting worker
    navigator.serviceWorker.getRegistration()
      .then(reg => {
        if (!reg) return;

        // If there's a waiting service worker, notify listeners an update is available
        if (reg.waiting) {
          console.log('⚠️ New service worker waiting to activate');
          updateCallbacks.forEach(callback => callback(true));
        }

        // Listen for updatefound: a new SW is installing
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            console.log('🛠️ Service worker state:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update installed and there's an active controller
              updateCallbacks.forEach(callback => callback(true));
            }
          });
        });
      })
      .catch(err => console.error('❌ Error checking SW registration:', err));
}

export function onAppUpdated(callback) {
  updateCallbacks.push(callback);
}

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
  
  // Register service worker
  registerServiceWorker();
  
  // Setup install prompt
  setupInstallPrompt();
  
  // Setup update listener
  setupUpdateListener();
  
  // Setup offline detection
  setupOfflineDetection();
  
  console.log('✅ PWA initialization complete');
}

export default {
  registerServiceWorker,
  setupInstallPrompt,
  isInstallPromptAvailable,
  promptInstall,
  onInstallPromptAvailable,
  checkForUpdates,
  setupUpdateListener,
  onAppUpdated,
  setupOfflineDetection,
  isOnline,
  onOfflineStatusChanged,
  requestNotificationPermission,
  canShowNotifications,
  initializePWA
};
