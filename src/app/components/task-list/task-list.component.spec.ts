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
    const parsed = parse('COA-3502');
    expect(parsed.jiraKey).toBe('COA-3502');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('');
  });

  it('should parse a Jira key followed by description correctly', () => {
    const parsed = parse('COA-3502 This is a very important story');
    expect(parsed.jiraKey).toBe('COA-3502');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('This is a very important story');
  });

  it('should parse a Jira URL followed by description correctly', () => {
    const parsed = parse('https://lighthouseintelligence.atlassian.net/browse/COA-3502 This is a very important story');
    expect(parsed.jiraKey).toBe('COA-3502');
    expect(parsed.jiraUrl).toBe('https://lighthouseintelligence.atlassian.net/browse/COA-3502');
    expect(parsed.remainingText).toBe('This is a very important story');
  });

  it('should parse a Jira URL alone correctly', () => {
    const parsed = parse('https://lighthouseintelligence.atlassian.net/browse/COA-3502');
    expect(parsed.jiraKey).toBe('COA-3502');
    expect(parsed.jiraUrl).toBe('https://lighthouseintelligence.atlassian.net/browse/COA-3502');
    expect(parsed.remainingText).toBe('');
  });

  it('should trim whitespace around the remaining text', () => {
    const parsed = parse('  COA-3502   Some description   ');
    expect(parsed.jiraKey).toBe('COA-3502');
    expect(parsed.jiraUrl).toBe('');
    expect(parsed.remainingText).toBe('Some description');
  });
});
