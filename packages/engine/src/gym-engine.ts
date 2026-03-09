// ============================================================
// GymEngine — Gym Membership, Leaderboard, Activity Feed
// Pure TypeScript. No framework imports. No direct DB calls.
// ============================================================

import type {
  EngineRepos,
  Gym,
  GymMembership,
  LeaderboardEntry,
  ActivityEvent,
} from './types';

export function createGymEngine(repos: Pick<
  EngineRepos,
  'gym' | 'gymMember' | 'progressEvent' | 'activityEvent' | 'user'
>) {
  return {
    /**
     * Search for gyms by name/location.
     */
    async searchGyms(query: string): Promise<Gym[]> {
      return repos.gym.search(query);
    },

    /**
     * Get full gym details.
     */
    async getGym(gymId: string): Promise<Gym | null> {
      return repos.gym.getById(gymId);
    },

    /**
     * Join a gym. Creates membership and posts activity event.
     */
    async joinGym(userId: string, gymId: string): Promise<GymMembership> {
      // Check if already a member
      const alreadyMember = await repos.gymMember.isMember(userId, gymId);
      if (alreadyMember) {
        throw new Error('Already a member of this gym');
      }

      const membership = await repos.gymMember.join(userId, gymId);

      // Post activity event
      const user = await repos.user.getById(userId);
      await repos.activityEvent.create({
        gymId,
        userId,
        eventType: 'MEMBER_JOINED',
        eventPayload: {
          displayName: user?.displayName ?? 'A new member',
        },
      });

      return membership;
    },

    /**
     * Leave a gym.
     */
    async leaveGym(userId: string, gymId: string): Promise<void> {
      return repos.gymMember.leave(userId, gymId);
    },

    /**
     * Get the improvement-based leaderboard for a gym.
     * Timeframe defaults to current month.
     */
    async getLeaderboard(gymId: string, timeframe?: string): Promise<LeaderboardEntry[]> {
      const since = timeframe ?? new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();

      const entries = await repos.progressEvent.getLeaderboard(gymId, since);

      // Add rank
      return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    },

    /**
     * Get the activity feed for a gym.
     */
    async getActivityFeed(
      gymId: string,
      limit?: number,
      cursor?: string
    ): Promise<ActivityEvent[]> {
      return repos.activityEvent.listByGym(gymId, limit ?? 20, cursor);
    },
  };
}

export type GymEngine = ReturnType<typeof createGymEngine>;
