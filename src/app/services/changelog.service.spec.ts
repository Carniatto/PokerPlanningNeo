import { describe, it, expect, beforeEach } from 'vitest';
import { ChangelogService } from './changelog.service';
import { CHANGELOG } from '../changelog';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockLocalStorage = new LocalStorageMock();

describe('ChangelogService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    // Stub global localStorage
    globalThis.localStorage = mockLocalStorage as any;
  });

  it('should initialize lastSeenVersion to latestVersion for a new user silently', () => {
    const service = new ChangelogService();
    expect(service.latestVersion).toBe(CHANGELOG[0].version);
    expect(service.lastSeenVersion()).toBe(CHANGELOG[0].version);
    expect(service.hasNewUpdates()).toBe(false);
    expect(service.unseenEntries()).toEqual([]);
  });

  it('should detect when there are new updates for returning users', () => {
    mockLocalStorage.setItem('poker_last_seen_version', '0.0.0');
    const service = new ChangelogService();
    expect(service.lastSeenVersion()).toBe('0.0.0');
    expect(service.hasNewUpdates()).toBe(true);
    expect(service.unseenEntries().length).toBeGreaterThan(0);
  });

  it('should open updates and history modes correctly and close to mark as read', () => {
    mockLocalStorage.setItem('poker_last_seen_version', '0.0.0');
    const service = new ChangelogService();
    
    // Test openUpdates
    service.openUpdates();
    expect(service.isOpen()).toBe(true);
    expect(service.viewMode()).toBe('updates');

    // Test close updates version
    service.close();
    expect(service.isOpen()).toBe(false);
    expect(service.lastSeenVersion()).toBe(service.latestVersion);
    expect(service.hasNewUpdates()).toBe(false);
  });
});
