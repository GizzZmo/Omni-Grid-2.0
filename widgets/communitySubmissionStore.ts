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
export const COMMUNITY_SUBMISSIONS_UPDATED_EVENT = 'omni-community-submissions-updated';

const isSubmissionStatus = (value: unknown): value is SubmissionStatus =>
  value === 'pending' || value === 'approved' || value === 'rejected' || value === 'in_review';

const isMarketplaceCategory = (value: unknown): value is MarketplaceCategory =>
  value === 'utility' ||
  value === 'developer' ||
  value === 'finance' ||
  value === 'creative' ||
  value === 'ai' ||
  value === 'productivity' ||
  value === 'community';

const isPluginSubmission = (value: unknown): value is PluginSubmission => {
  if (!value || typeof value !== 'object') return false;
  const submission = value as Record<string, unknown>;
  return (
    typeof submission.id === 'string' &&
    typeof submission.widgetId === 'string' &&
    typeof submission.name === 'string' &&
    typeof submission.description === 'string' &&
    typeof submission.version === 'string' &&
    typeof submission.author === 'string' &&
    isMarketplaceCategory(submission.category) &&
    Array.isArray(submission.tags) &&
    submission.tags.every(tag => typeof tag === 'string') &&
    typeof submission.repositoryUrl === 'string' &&
    Array.isArray(submission.checklistPassed) &&
    submission.checklistPassed.every(item => typeof item === 'string') &&
    typeof submission.submittedAt === 'number' &&
    isSubmissionStatus(submission.status)
  );
};

export const loadCommunitySubmissions = (): PluginSubmission[] => {
  try {
    const raw = localStorage.getItem(COMMUNITY_SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPluginSubmission) : [];
  } catch {
    return [];
  }
};

export const saveCommunitySubmissions = (items: PluginSubmission[]) => {
  try {
    localStorage.setItem(COMMUNITY_SUBMISSIONS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new window.CustomEvent(COMMUNITY_SUBMISSIONS_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
};
