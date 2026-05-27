export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
  fixes?: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-05-27',
    features: [
      'Added drag-and-drop task reordering using Angular CDK',
      'Added external JIRA link and description fields to tasks'
    ],
    fixes: [
      'Fixed Cancel button styling in the Remove Task dialog'
    ]
  }
];
