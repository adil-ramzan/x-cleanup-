import { createContext, useContext } from 'react';
import { mockContentSource, type ContentSource } from '../services/contentSource';
import type { XAccount } from '../services/x/session';

export interface ActiveContentSource {
  source: ContentSource;
  /** Connected account when showing live data; null in sample mode. */
  account: XAccount | null;
}

export const ContentSourceContext = createContext<ActiveContentSource>({ source: mockContentSource, account: null });

export const useActiveContentSource = (): ActiveContentSource => useContext(ContentSourceContext);
