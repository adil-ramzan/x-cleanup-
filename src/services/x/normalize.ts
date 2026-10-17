import type { AccountRef, ContentItem, ContentKind, Engagement, PostItem, ReplyItem, RepostItem } from '../../types/content';
import type { XApiPost, XApiUser, XTimelineResponse } from './apiTypes';
import { xPostUrl } from './config';

/** Human-readable note about incomplete or skipped records; `kind` limits it to one page of the UI. */
export interface SourceWarning {
  kind?: ContentKind;
  text: string;
}

export interface NormalizedPage {
  items: ContentItem[];
  warnings: SourceWarning[];
}

interface Owner {
  id: string;
  username: string;
  name: string;
}

const RT_PREFIX = /^RT @([A-Za-z0-9_]{1,15}):\s?/;

function toEngagement(p: XApiPost): Engagement | undefined {
  const m = p.public_metrics;
  if (!m) return undefined;
  return {
    likes: m.like_count ?? 0,
    reposts: m.retweet_count ?? 0,
    replies: m.reply_count ?? 0,
    views: m.impression_count,
  };
}

const fullText = (p: XApiPost): string => p.note_tweet?.text ?? p.text ?? '';

function toAccountRef(user: XApiUser | undefined): AccountRef | null {
  if (!user?.username) return null;
  return { handle: user.username, displayName: user.name ?? user.username };
}

/**
 * Converts one page of GET /2/users/:id/tweets into UI records.
 * Classification uses referenced_tweets: "retweeted" → repost, "replied_to" → reply,
 * anything else (including quote posts) → post. Nothing is invented: fields X
 * didn't return stay empty and are reported as warnings.
 */
export function normalizeTimelinePage(body: XTimelineResponse | null, owner: Owner): NormalizedPage {
  const items: ContentItem[] = [];
  const warnings: SourceWarning[] = [];
  if (!body?.data?.length) {
    if (body?.errors?.length) warnings.push({ text: `X reported ${body.errors.length} problem(s) with this page of results.` });
    return { items, warnings };
  }

  const included = body.includes?.tweets ?? body.includes?.posts ?? [];
  const postsById = new Map(included.map((p) => [p.id, p]));
  const usersById = new Map((body.includes?.users ?? []).map((u) => [u.id, u]));
  usersById.set(owner.id, { id: owner.id, username: owner.username, name: owner.name });

  let skipped = 0;
  let unavailableOriginals = 0;

  for (const p of body.data) {
    if (!p.id || !p.created_at) {
      skipped++;
      continue;
    }
    const base = { id: p.id, createdAt: p.created_at, source: 'x' as const, url: xPostUrl(owner.username, p.id) };
    const refs = p.referenced_tweets ?? [];
    const retweeted = refs.find((r) => r.type === 'retweeted');
    const repliedTo = refs.find((r) => r.type === 'replied_to');

    if (retweeted) {
      const original = postsById.get(retweeted.id);
      let author = toAccountRef(original?.author_id ? usersById.get(original.author_id) : undefined);
      let text: string | null = original ? fullText(original) : null;
      if (!original) {
        unavailableOriginals++;
        // The repost record itself still carries "RT @handle: <preview>"; use that rather than nothing.
        const m = RT_PREFIX.exec(p.text ?? '');
        if (m) {
          author ??= { handle: m[1], displayName: m[1] };
          text = (p.text ?? '').slice(m[0].length) || null;
        }
      }
      const item: RepostItem = {
        ...base,
        kind: 'repost',
        original: {
          id: retweeted.id,
          author,
          text,
          postedAt: original?.created_at ?? null,
          url: author ? xPostUrl(author.handle, retweeted.id) : undefined,
        },
      };
      items.push(item);
    } else if (repliedTo || p.in_reply_to_user_id) {
      const item: ReplyItem = {
        ...base,
        kind: 'reply',
        text: fullText(p),
        inReplyTo: toAccountRef(p.in_reply_to_user_id ? usersById.get(p.in_reply_to_user_id) : undefined),
        engagement: toEngagement(p),
      };
      items.push(item);
    } else {
      const item: PostItem = {
        ...base,
        kind: 'post',
        text: fullText(p),
        hasMedia: (p.attachments?.media_keys?.length ?? 0) > 0,
        engagement: toEngagement(p),
      };
      items.push(item);
    }
  }

  if (skipped) warnings.push({ text: `${skipped} record(s) were missing required fields and were skipped.` });
  if (unavailableOriginals) {
    warnings.push({
      kind: 'repost',
      text: `${unavailableOriginals} reposted original(s) couldn’t be loaded (deleted, protected, or unavailable); a shortened preview is shown where X provided one.`,
    });
  }
  return { items, warnings };
}
