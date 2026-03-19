import { useMemo } from 'react';
import type { Descendant } from 'slate';
import { estimatePageCount } from '@/lib/screenplay/pageCount';

export function usePageCount(document: Descendant[]): number {
  return useMemo(() => estimatePageCount(document), [document]);
}
