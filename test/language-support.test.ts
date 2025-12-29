import { describe, it, expect } from 'vitest';
import { CYBER_EDITOR_LANGUAGES } from '../widgets/CyberEditor';
import { DEV_DOCS_LANGUAGES } from '../widgets/devdocsLanguages';

describe('Language support alignment', () => {
  it('keeps CyberEditor languages in sync with DocuHub/DevDocs', () => {
    expect(CYBER_EDITOR_LANGUAGES).toEqual(DEV_DOCS_LANGUAGES);
  });

  it('includes core DevDocs languages', () => {
    const expectedLanguages = [
      'typescript',
      'python',
      'java',
      'cpp',
      'csharp',
      'go',
      'rust',
      'php',
      'ruby',
      'kotlin',
      'swift',
      'graphql',
      'docker',
    ];

    expect(DEV_DOCS_LANGUAGES).toEqual(expect.arrayContaining(expectedLanguages));
  });
});
