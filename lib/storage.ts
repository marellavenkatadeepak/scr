// Company-specific data storage utilities using InsForge
// This ensures data isolation between companies

import { insforge } from './insforge';
import { Post } from '../types';

// Database table names
const COMPANY_POSTS_TABLE = 'company_posts';
const BMSIT_SURVEYS_TABLE = 'bmsit_surveys';

// Helper function to format timestamp for display
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Convert database row to Post type
const dbRowToPost = (row: any): Post => {
  return {
    id: row.id,
    content: row.content,
    timestamp: formatTimestamp(new Date(row.created_at)),
    likes: row.likes || 0,
    comments: row.comments || 0,
    tags: row.tags || [],
    hasImage: row.has_image || false,
    imageUrl: row.image_url,
    isPoll: row.is_poll || false,
    pollData: row.poll_data ? JSON.parse(JSON.stringify(row.poll_data)) : undefined,
    userId: row.user_id,
    userName: row.user_name,
    userInitials: row.user_initials,
  };
};

// Convert Post type to database row
const postToDbRow = (post: Post, companyId: string) => {
  return {
    company_id: companyId,
    content: post.content,
    tags: post.tags || [],
    likes: post.likes || 0,
    comments: post.comments || 0,
    has_image: post.hasImage || false,
    image_url: post.imageUrl || null,
    is_poll: post.isPoll || false,
    poll_data: post.pollData || null,
    user_id: post.userId || null,
    user_name: post.userName || null,
    user_initials: post.userInitials || null,
  };
};

/**
 * Get company-specific posts from InsForge
 */
export const getCompanyPosts = async (companyId: string): Promise<Post[]> => {
  try {
    const { data, error } = await insforge.database
      .from(COMPANY_POSTS_TABLE)
      .select()
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data ? data.map(dbRowToPost) : [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

/**
 * Add a post to company-specific storage in InsForge
 */
export const addCompanyPost = async (companyId: string, post: Post): Promise<Post | null> => {
  try {
    const dbRow = postToDbRow(post, companyId);

    const { data, error } = await insforge.database
      .from(COMPANY_POSTS_TABLE)
      .insert([dbRow])
      .select();

    if (error) {
      console.error('Error adding post:', error);
      return null;
    }

    return data && data[0] ? dbRowToPost(data[0]) : null;
  } catch (error) {
    console.error('Error adding post:', error);
    return null;
  }
};

/**
 * Update a post (e.g., increment likes)
 */
export const updateCompanyPost = async (postId: string, updates: Partial<Post>): Promise<boolean> => {
  try {
    const dbUpdates: any = {};
    if (updates.likes !== undefined) dbUpdates.likes = updates.likes;
    if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
    if (updates.pollData !== undefined) dbUpdates.poll_data = updates.pollData;

    const { error } = await insforge.database
      .from(COMPANY_POSTS_TABLE)
      .update(dbUpdates)
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    return false;
  }
};

/**
 * Save BMSIT survey response to InsForge
 */
export const saveBMSITSurvey = async (answers: Record<number, number | string>): Promise<boolean> => {
  try {
    const { error } = await insforge.database
      .from(BMSIT_SURVEYS_TABLE)
      .insert([{ answers }]);

    if (error) {
      console.error('Error saving BMSIT survey:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving BMSIT survey:', error);
    return false;
  }
};

/**
 * Get all BMSIT survey responses from InsForge
 */
export const getBMSITSurveys = async (): Promise<Array<{ timestamp: string; answers: Record<number, number | string> }>> => {
  try {
    const { data, error } = await insforge.database
      .from(BMSIT_SURVEYS_TABLE)
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching BMSIT surveys:', error);
      return [];
    }

    return data
      ? data.map((row: any) => ({
          timestamp: row.created_at,
          answers: row.answers,
        }))
      : [];
  } catch (error) {
    console.error('Error fetching BMSIT surveys:', error);
    return [];
  }
};

export interface SurveyAnalytics {
  totalResponses: number;
  overallHealthScore: number; // 0–100
  averageRating: number;      // 1–5
  questionAverages: Record<number, number>; // questionId → avg score (1–5)
  topQuestion: { id: number; label: string; avg: number } | null;
  bottomQuestion: { id: number; label: string; avg: number } | null;
  trend: 'up' | 'stable' | 'down';
  latestFeedbacks: string[]; // last 5 open-text answers (Q10)
}

export const QUESTION_LABELS: Record<number, string> = {
  1: 'Overall Teaching Experience',
  2: 'Administration Support',
  3: 'Infrastructure & Facilities',
  4: 'Student Interaction',
  5: 'Professional Development',
  6: 'Work-Life Balance',
  7: 'Compensation & Benefits',
  8: 'Communication & Transparency',
  9: 'Academic Resources',
};

/**
 * Compute analytics from all stored BMSIT surveys in InsForge.
 * Returns per-question averages, overall health score (0–100), trend, and latest text feedback.
 */
export const getSurveyAnalytics = async (): Promise<SurveyAnalytics> => {
  const surveys = await getBMSITSurveys();

  const empty: SurveyAnalytics = {
    totalResponses: 0,
    overallHealthScore: 0,
    averageRating: 0,
    questionAverages: {},
    topQuestion: null,
    bottomQuestion: null,
    trend: 'stable',
    latestFeedbacks: [],
  };

  if (surveys.length === 0) return empty;

  // Accumulate scores per question
  const scaleAccum: Record<number, number[]> = {};
  const feedbacks: string[] = [];

  surveys.forEach(({ answers }) => {
    Object.entries(answers).forEach(([key, val]) => {
      const qId = parseInt(key);
      if (qId <= 9 && typeof val === 'number') {
        if (!scaleAccum[qId]) scaleAccum[qId] = [];
        scaleAccum[qId].push(val);
      }
      if (qId === 10 && typeof val === 'string' && val.trim()) {
        feedbacks.push(val.trim());
      }
    });
  });

  // Calculate per-question averages
  const questionAverages: Record<number, number> = {};
  Object.entries(scaleAccum).forEach(([key, vals]) => {
    const qId = parseInt(key);
    questionAverages[qId] = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
  });

  const allAvgs = Object.values(questionAverages);
  const averageRating = allAvgs.length
    ? Math.round((allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length) * 100) / 100
    : 0;

  // Scale 1–5 → 0–100
  const overallHealthScore = Math.round(((averageRating - 1) / 4) * 100);

  // Top and bottom questions
  const sorted = Object.entries(questionAverages).sort(([, a], [, b]) => b - a);
  const topEntry = sorted[0];
  const botEntry = sorted[sorted.length - 1];
  const topQuestion = topEntry
    ? { id: parseInt(topEntry[0]), label: QUESTION_LABELS[parseInt(topEntry[0])] ?? `Q${topEntry[0]}`, avg: topEntry[1] }
    : null;
  const bottomQuestion = botEntry && botEntry[0] !== topEntry?.[0]
    ? { id: parseInt(botEntry[0]), label: QUESTION_LABELS[parseInt(botEntry[0])] ?? `Q${botEntry[0]}`, avg: botEntry[1] }
    : null;

  // Simple trend: compare first half vs second half of surveys
  let trend: 'up' | 'stable' | 'down' = 'stable';
  if (surveys.length >= 4) {
    const half = Math.floor(surveys.length / 2);
    const older = surveys.slice(half);
    const newer = surveys.slice(0, half);
    const avg = (arr: typeof surveys) => {
      const scores = arr.flatMap(s =>
        Object.entries(s.answers)
          .filter(([k, v]) => parseInt(k) <= 9 && typeof v === 'number')
          .map(([, v]) => v as number)
      );
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };
    const diff = avg(newer) - avg(older);
    trend = diff > 0.2 ? 'up' : diff < -0.2 ? 'down' : 'stable';
  }

  return {
    totalResponses: surveys.length,
    overallHealthScore,
    averageRating,
    questionAverages,
    topQuestion,
    bottomQuestion,
    trend,
    latestFeedbacks: feedbacks.slice(0, 5),
  };
};

// Legacy functions for backward compatibility

/**
 * Store company-specific posts (legacy - now uses InsForge)
 * @deprecated Use addCompanyPost instead
 */
export const saveCompanyPosts = async (companyId: string, posts: Post[]): Promise<void> => {
  console.warn('saveCompanyPosts is deprecated. Use addCompanyPost instead.');
};

/**
 * Get company-specific messages (legacy - for future use)
 */
export const getCompanyMessages = async (companyId: string): Promise<any[]> => {
  return [];
};

/**
 * Save company-specific messages (legacy - for future use)
 */
export const saveCompanyMessages = async (companyId: string, messages: any[]): Promise<void> => {};

/**
 * Get company-specific analytics (legacy - for future use)
 */
export const getCompanyAnalytics = async (companyId: string): Promise<any> => {
  return null;
};

/**
 * Save company-specific analytics (legacy - for future use)
 */
export const saveCompanyAnalytics = async (companyId: string, analytics: any): Promise<void> => {};
