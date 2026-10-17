export type ContentKind = 'post' | 'repost' | 'reply';

/**
 * Where an item came from: 'mock' for built-in sample data, 'x' for records
 * retrieved from the connected X account. UI code uses this to label data.
 */
export type DataSource = 'mock' | 'x';

export interface Engagement {
  likes: number;
  reposts: number;
  replies: number;
  /** Not always returned by the API. */
  views?: number;
}

export interface AccountRef {
  displayName: string;
  handle: string;
}

interface ContentItemBase {
  id: string;
  /** ISO 8601 timestamp of when the account performed the action. */
  createdAt: string;
  source: DataSource;
  /** Permalink on x.com, when known. Sample data has none. */
  url?: string;
}

export interface PostItem extends ContentItemBase {
  kind: 'post';
  text: string;
  hasMedia: boolean;
  engagement?: Engagement;
}

export interface RepostItem extends ContentItemBase {
  kind: 'repost';
  original: {
    id?: string;
    /** null when the original's author couldn't be resolved (e.g. deleted or protected). */
    author: AccountRef | null;
    /** null when the original post is unavailable. */
    text: string | null;
    postedAt: string | null;
    url?: string;
  };
}

export interface ReplyItem extends ContentItemBase {
  kind: 'reply';
  text: string;
  /** null when the replied-to account couldn't be resolved. */
  inReplyTo: AccountRef | null;
  engagement?: Engagement;
}

export type ContentItem = PostItem | RepostItem | ReplyItem;

export type ContentItemOf<K extends ContentKind> = Extract<ContentItem, { kind: K }>;
