/**
 * Type definitions for Stats Controller responses
 */

import { type UserStats, type UserActivity } from '@/database/types';

/**
 * Response data for getUserStats - uses UserStats directly
 */
export type UserStatsData = UserStats;

/**
 * Response data for getUserActivity
 */
export interface UserActivityData {
    activities: UserActivity[];
}