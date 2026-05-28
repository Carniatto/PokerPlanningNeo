import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { TaskListComponent } from './task-list.component';

describe('TaskListComponent - getParsedIssueKey', () => {
  const getParsedIssueKey = TaskListComponent.prototype.getParsedIssueKey;

  it('should parse a pure Jira key correctly', () => {
    const key = getParsedIssueKey('JIRA-1234');
    expect(key).toBe('JIRA-1234');
  });

  it('should parse a Jira key from browse URL correctly', () => {
    const key = getParsedIssueKey('https://company.atlassian.net/browse/JIRA-1234');
    expect(key).toBe('JIRA-1234');
  });

  it('should return empty string for non-matching input', () => {
    const key = getParsedIssueKey('Some random description task');
    expect(key).toBe('');
  });
});
