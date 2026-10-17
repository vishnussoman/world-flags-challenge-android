import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.worldflagschallenge.app',
  appName: 'World Flags Challenge',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#020617',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
    },
    ScreenOrientation: {
      orientation: 'portrait',
    },
  },
};

export default config;
