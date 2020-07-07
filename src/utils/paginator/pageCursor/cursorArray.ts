import { PageCursorType, pageToCursorObject } from './cursorObject';

interface Props<T, K> {
  start: number;
  end: number;
  pageInfo: {
    currentPage: number;
    size: number;
    totalPages: number;
  };
  model: K;
  findManyArgs: T;
}

// Returns an array of PageCursor objects
// from start to end (page numbers).
export async function pageCursorsToArray<FindManyArgs>({
  start,
  end,
  pageInfo,
  model,
  findManyArgs,
}: Props<FindManyArgs, typeof model>): Promise<PageCursorType[]> {
  let page;
  const cursors = [];
  for (page = start; page <= end; page++) {
    const cursorResult = await pageToCursorObject<FindManyArgs>({
      page,
      pageInfo,
      model,
      findManyArgs,
    });
    cursors.push(cursorResult);
  }
  return cursors;
}
