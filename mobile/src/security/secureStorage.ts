import * as SecureStore from 'expo-secure-store';

/**
 * Secure token storage backed by the iOS Keychain / Android Keystore via
 * expo-secure-store. Access/refresh tokens live here, never in plain storage.
 */
const ACCESS = 'jarvis.access';
const REFRESH = 'jarvis.refresh';
const API_BASE = 'jarvis.apiBase';

export const secureStorage = {
  async setTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS, access);
    await SecureStore.setItemAsync(REFRESH, refresh);
  },
  async getAccess() {
    return SecureStore.getItemAsync(ACCESS);
  },
  async getRefresh() {
    return SecureStore.getItemAsync(REFRESH);
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
  },
  async setApiBase(url: string) {
    await SecureStore.setItemAsync(API_BASE, url);
  },
  async getApiBase() {
    return SecureStore.getItemAsync(API_BASE);
  },
};
