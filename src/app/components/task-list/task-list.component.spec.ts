import '@angular/compiler';
import { TaskListComponent } from './task-list.component';

describe('TaskListComponent - parseTaskInput', () => {
  const parse = TaskListComponent.prototype.parseTaskInput;

  it('should parse a pure description task correctly', () => {
    const parsed = parse('Implement login page');
    expect(parsed.jiraKey).toBe('');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('Implement login page');
  });

  it('should parse a pure Jira key correctly', () => {
    const parsed = parse('JIRA-1234');
    expect(parsed.jiraKey).toBe('JIRA-1234');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('');
  });

  it('should parse a Jira key followed by description correctly', () => {
    const parsed = parse('JIRA-1234 This is a very important story');
    expect(parsed.jiraKey).toBe('JIRA-1234');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('This is a very important story');
  });

  it('should parse a Jira URL followed by description correctly', () => {
    const parsed = parse('https://company.atlassian.net/browse/JIRA-1234 This is a very important story');
    expect(parsed.jiraKey).toBe('JIRA-1234');
    expect(parsed.jiraUrl).toBe('https://company.atlassian.net/browse/JIRA-1234');
    expect(parsed.remainingText).toBe('This is a very important story');
  });

  it('should parse a Jira URL alone correctly', () => {
    const parsed = parse('https://company.atlassian.net/browse/JIRA-1234');
    expect(parsed.jiraKey).toBe('JIRA-1234');
    expect(parsed.jiraUrl).toBe('https://company.atlassian.net/browse/JIRA-1234');
    expect(parsed.remainingText).toBe('');
  });

  it('should trim whitespace around the remaining text', () => {
    const parsed = parse('  JIRA-1234   Some description   ');
    expect(parsed.jiraKey).toBe('JIRA-1234');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('Some description');
  });
});
