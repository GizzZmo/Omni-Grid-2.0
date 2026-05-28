import { MarketplaceCategory } from '../types';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'in_review';

export interface PluginSubmission {
  id: string;
  widgetId: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: MarketplaceCategory;
  tags: string[];
  repositoryUrl: string;
  checklistPassed: string[];
  submittedAt: number;
  status: SubmissionStatus;
  reviewNote?: string;
}

export const COMMUNITY_SUBMISSIONS_STORAGE_KEY = 'omni-community-submissions';

export const loadCommunitySubmissions = (): PluginSubmission[] => {
  try {
    const raw = localStorage.getItem(COMMUNITY_SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PluginSubmission[]) : [];
  } catch {
    return [];
  }
};

export const saveCommunitySubmissions = (items: PluginSubmission[]) => {
  try {
    localStorage.setItem(COMMUNITY_SUBMISSIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};
