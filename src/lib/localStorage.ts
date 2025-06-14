
"use client"; // Ensures this code runs only on the client

const APP_PREFIX = "platepilot_";

export function generateId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}


export function saveToLocalStorage<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    try {
      const serializedData = JSON.stringify(data);
      window.localStorage.setItem(APP_PREFIX + key, serializedData);
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    try {
      const serializedData = window.localStorage.getItem(APP_PREFIX + key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Error loading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue; // Return default if not in browser environment
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(APP_PREFIX + key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  }
}
