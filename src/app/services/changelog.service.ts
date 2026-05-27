import { Injectable, signal, computed } from '@angular/core';
import { CHANGELOG, ChangelogEntry } from '../changelog';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  readonly latestVersion = CHANGELOG[0].version;
  
  private lastSeenVersionSignal = signal<string | null>(null);
  lastSeenVersion = this.lastSeenVersionSignal.asReadonly();
  
  isOpen = signal<boolean>(false);
  viewMode = signal<'updates' | 'history'>('history');

  constructor() {
    this.initVersion();
  }

  private initVersion() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const seen = localStorage.getItem('poker_last_seen_version');
      if (seen === null) {
        // First-time visitor: set version silently to latest so they aren't spammed with historic changelogs
        localStorage.setItem('poker_last_seen_version', this.latestVersion);
        this.lastSeenVersionSignal.set(this.latestVersion);
      } else {
        this.lastSeenVersionSignal.set(seen);
      }
    }
  }

  // Returns true if there is a version mismatch and they have seen a previous version
  hasNewUpdates = computed(() => {
    const seen = this.lastSeenVersionSignal();
    return seen !== null && seen !== this.latestVersion;
  });

  // Filters changelog entries to only show versions newer than the last seen version
  unseenEntries = computed(() => {
    const seen = this.lastSeenVersionSignal();
    if (!seen) return [];
    
    // Find index of the last seen version
    const seenIndex = CHANGELOG.findIndex(entry => entry.version === seen);
    
    if (seenIndex === -1) {
      // If version is unrecognized/obsolete, show all entries
      return CHANGELOG;
    }
    
    // Return all entries up to (but not including) the seen index
    return CHANGELOG.slice(0, seenIndex);
  });

  openUpdates() {
    if (this.unseenEntries().length > 0) {
      this.viewMode.set('updates');
      this.isOpen.set(true);
    }
  }

  openHistory() {
    this.viewMode.set('history');
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    
    // Mark as read: update localStorage and signal
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('poker_last_seen_version', this.latestVersion);
      this.lastSeenVersionSignal.set(this.latestVersion);
    }
  }
}
