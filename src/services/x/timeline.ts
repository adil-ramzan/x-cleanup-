import type { XTimelineResponse } from './apiTypes';
import { authorizedGet } from './auth';
import { TIMELINE_PAGE_SIZE } from './config';

/**
 * One page of GET /2/users/:id/tweets — the authenticated user's own timeline,
 * which contains posts, replies, and reposts. X serves at most the 3,200 most
 * recent items through this endpoint.
 */
export function fetchTimelinePage(userId: string, paginationToken?: string): Promise<XTimelineResponse> {
  const params: Record<string, string> = {
    max_results: String(TIMELINE_PAGE_SIZE),
    'tweet.fields': 'created_at,author_id,in_reply_to_user_id,referenced_tweets,public_metrics,attachments,note_tweet',
    expansions: 'referenced_tweets.id,referenced_tweets.id.author_id,in_reply_to_user_id',
    'user.fields': 'username,name',
  };
  if (paginationToken) params.pagination_token = paginationToken;
  return authorizedGet(`/2/users/${encodeURIComponent(userId)}/tweets`, params) as Promise<XTimelineResponse>;
}
