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

describe('TaskListComponent - getJiraBadgeUrl', () => {
  let store: Record<string, string> = {};

  beforeAll(() => {
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true
    });
  });

  beforeEach(() => {
    store = {};
  });

  it('should return task.jiraUrl if present', () => {
    const component = {
      jiraAuth: { accessToken: () => null },
      selectedJiraSite: () => '',
      jiraSites: () => []
    } as any;
    const url = TaskListComponent.prototype.getJiraBadgeUrl.call(component, { jiraKey: 'TEST-123', jiraUrl: 'https://custom.com/browse/TEST-123' });
    expect(url).toBe('https://custom.com/browse/TEST-123');
  });

  it('should return null if task.jiraUrl is absent and jira is not connected', () => {
    const component = {
      jiraAuth: { accessToken: () => null },
      selectedJiraSite: () => '',
      jiraSites: () => []
    } as any;
    const url = TaskListComponent.prototype.getJiraBadgeUrl.call(component, { jiraKey: 'TEST-123' });
    expect(url).toBeNull();
  });

  it('should construct URL if jira is connected and site domain is available', () => {
    const component = {
      jiraAuth: { accessToken: () => 'mock-token' },
      selectedJiraSite: () => 'site-1',
      jiraSites: () => [{ id: 'site-1', name: 'My Site', url: 'https://my-company.atlassian.net' }]
    } as any;
    const url = TaskListComponent.prototype.getJiraBadgeUrl.call(component, { jiraKey: 'TEST-123' });
    expect(url).toBe('https://my-company.atlassian.net/browse/TEST-123');
  });

  it('should fallback to NEO_LAST_JIRA_DOMAIN if site list does not contain selected site', () => {
    const component = {
      jiraAuth: { accessToken: () => 'mock-token' },
      selectedJiraSite: () => 'site-2',
      jiraSites: () => []
    } as any;

    localStorage.setItem('NEO_LAST_JIRA_DOMAIN', 'fallback.atlassian.net');
    const url = TaskListComponent.prototype.getJiraBadgeUrl.call(component, { jiraKey: 'TEST-123' });
    expect(url).toBe('https://fallback.atlassian.net/browse/TEST-123');
  });
});
