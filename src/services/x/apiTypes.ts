/** Subset of X API v2 response shapes used by this extension. Every field is treated as optional. */

export interface XApiReferencedPost {
  type: 'retweeted' | 'quoted' | 'replied_to' | string;
  id: string;
}

export interface XApiPost {
  id: string;
  text?: string;
  created_at?: string;
  author_id?: string;
  in_reply_to_user_id?: string;
  referenced_tweets?: XApiReferencedPost[];
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
    quote_count?: number;
    impression_count?: number;
  };
  attachments?: { media_keys?: string[] };
  /** Full text of long-form posts (> 280 characters). */
  note_tweet?: { text?: string };
}

export interface XApiUser {
  id: string;
  username?: string;
  name?: string;
}

/** Partial-error entries returned alongside data (e.g. a referenced post that was deleted). */
export interface XApiProblem {
  title?: string;
  detail?: string;
  type?: string;
  resource_type?: string;
  resource_id?: string;
}

export interface XTimelineResponse {
  data?: XApiPost[];
  includes?: {
    /** v2 has historically used "tweets"; newer docs name it "posts". Both are accepted. */
    tweets?: XApiPost[];
    posts?: XApiPost[];
    users?: XApiUser[];
  };
  errors?: XApiProblem[];
  meta?: {
    result_count?: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
}
