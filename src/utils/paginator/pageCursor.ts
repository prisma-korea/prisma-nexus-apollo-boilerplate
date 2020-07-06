import { PrismaClient } from '@prisma/client';

interface Props3<T, K> {
  page: number,
  pageInfo: {
    currentPage: number,
    size: number,
    totalPages: number,
  },
  model: K,
  findManyArgs: T,
}

// Returns an opaque cursor for a page.
async function pageToCursorObject<FindManyArgs>({
  page,
  pageInfo,
  model,
  findManyArgs,
}: Props3<FindManyArgs, typeof model>) {
  const { currentPage, size, totalPages } = pageInfo;
  let cursorId: number | string;
  const prisma = new PrismaClient();
  const prismaModel = prisma[model.name.toLowerCase()];

  // first
  if (page === 1) {
    let findManyArgsForFirst: FindManyArgs;
    // @ts-ignore
    if (findManyArgs?.orderBy) {
      // @ts-ignore
      const { orderBy } = findManyArgs;
      findManyArgsForFirst = { ...findManyArgsForFirst, orderBy: { ...orderBy } };
    }
    // @ts-ignore
    if (findManyArgs?.where) {
      // @ts-ignore
      const { where } = findManyArgs;
      findManyArgsForFirst = { ...findManyArgsForFirst, where: { ...where } };
    }
    const result = await prismaModel.findMany({
      ...findManyArgsForFirst,
      take: 1,
    });
    cursorId = result[0].id;

  // last
  } else if (page === totalPages) {
    let findManyArgsForLast: FindManyArgs;
    // @ts-ignore
    if (findManyArgs?.orderBy) {
      // @ts-ignore
      const orderByKey = Object.keys(findManyArgs.orderBy)[0];
      // @ts-ignore
      const orderDirection = findManyArgs.orderBy[orderByKey] === 'asc' ? 'desc' : 'asc';
      findManyArgsForLast = {
        ...findManyArgsForLast,
        orderBy: {
          [orderByKey]: orderDirection,
        },
      };
    } else {
      findManyArgsForLast = {
        ...findManyArgsForLast,
        orderBy: {
          id: 'desc',
        },
      };
    }
    // @ts-ignore
    if (findManyArgs?.where) {
      // @ts-ignore
      const { where } = findManyArgs;
      findManyArgsForLast = { ...findManyArgsForLast, where: { ...where } };
    }
    const result = await prismaModel.findMany({
      ...findManyArgsForLast,
      take: 1,
    });
    cursorId = result[0].id;

  // around & previous
  } else {
    const distance = (page - currentPage) * size;
    const takeSkipArgs = {
      take: distance < 0 ? -1 : 1,
      skip: distance < 0 ? distance * -1 : distance,
    };
    const result = await prismaModel.findMany({
      ...findManyArgs,
      ...takeSkipArgs,
    });
    cursorId = result[0].id;
  }

  return {
    cursor: Buffer.from('saltysalt'.concat(String(cursorId))).toString('base64'),
    page,
    isCurrent: currentPage === page,
  };
}

interface Props2<T, K> {
  start: number,
  end: number,
  pageInfo: {
    currentPage: number,
    size: number,
    totalPages: number,
  },
  model: K,
  findManyArgs: T,
}

// Returns an array of PageCursor objects
// from start to end (page numbers).
async function pageCursorsToArray<FindManyArgs>({
  start,
  end,
  pageInfo,
  model,
  findManyArgs,
}: Props2<FindManyArgs, typeof model>) {
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

// Returns the total number of pagination results capped to PAGE_NUMBER_CAP.
export function computeTotalPages(totalCount:number, size: number): number {
  return Math.ceil(totalCount / size);
}

interface pageCursor {
  cursor: string,
  page: number,
  isCurrent: boolean,
}

interface pageCursors {
  first: pageCursor,
  around: [pageCursor],
  last: pageCursor,
  previous: pageCursor
}

interface Props<T, K> {
  pageInfo: {
    currentPage: number,
    size: number,
    buttonNum: number,
  },
  model: K,
  totalCount: number,
  findManyArgs: T,
}

export async function createPageCursors<FindManyArgs>({
  pageInfo: { currentPage, size, buttonNum },
  model,
  findManyArgs,
  totalCount,
}: Props<FindManyArgs, typeof model>): Promise<pageCursors> {
  // If buttonNum is even, bump it up by 1, and log out a warning.
  if (buttonNum % 2 === 0) {
    console.log(`Max of ${buttonNum} passed to page cursors, using ${buttonNum + 1}`);
    buttonNum = buttonNum + 1;
  }

  let pageCursors;
  const totalPages = computeTotalPages(totalCount, size);
  const pageInfo = { currentPage, size, totalPages };

  // Degenerate case of no records found. 1 / 1 / 1
  if (totalPages === 0) {
    // pageCursors = {
    //   around: [pageToCursorObject<FindManyArgs>(1, 1, pageInfo, model, findManyArgs)],
    // }
    pageCursors = {
      around: [],
    };
  } else if (totalPages <= buttonNum) {
    // Collection is short, and `around` includes page 1 and the last page. 1 / 1 2 3 / 7
    const around = await pageCursorsToArray<FindManyArgs>({
      start: 1,
      end: totalPages,
      pageInfo,
      model,
      findManyArgs,
    });
    pageCursors = {
      around,
    };
  } else if (currentPage <= Math.floor(buttonNum / 2) + 1) {
    // We are near the beginning, and `around` will include page 1. 1 / 1 2 3 / 7
    const last = await pageToCursorObject<FindManyArgs>({
      page: totalPages,
      pageInfo,
      model,
      findManyArgs,
    });
    const around = await pageCursorsToArray<FindManyArgs>({
      start: 1,
      end: buttonNum - 1,
      pageInfo,
      model,
      findManyArgs,
    });
    pageCursors = {
      last,
      around,
    };
  } else if (currentPage >= totalPages - Math.floor(buttonNum / 2)) {
    // We are near the end, and `around` will include the last page. 1 / 5 6 7 / 7
    const first = await pageToCursorObject<FindManyArgs>({
      page: 1,
      pageInfo,
      model,
      findManyArgs,
    });
    const around = await pageCursorsToArray<FindManyArgs>({
      start: totalPages - buttonNum + 2,
      end: totalPages,
      pageInfo,
      model,
      findManyArgs,
    });
    pageCursors = {
      first,
      around,
    };
  } else {
    // We are in the middle, and `around` doesn't include the first or last page. 1 / 4 5 6 / 7
    const first = await pageToCursorObject<FindManyArgs>({
      page: 1,
      pageInfo,
      model,
      findManyArgs,
    });
    const last = await pageToCursorObject<FindManyArgs>({
      page: totalPages,
      pageInfo,
      model,
      findManyArgs,
    });
    const offset = Math.floor((buttonNum - 3) / 2);
    const around = await pageCursorsToArray<FindManyArgs>({
      start: currentPage - offset,
      end: currentPage + offset,
      pageInfo,
      model,
      findManyArgs,
    });
    pageCursors = {
      first,
      around,
      last,
    };
  }
  if (currentPage > 1 && totalPages > 1) {
    const previous = await pageToCursorObject<FindManyArgs>({
      page: currentPage - 1,
      pageInfo,
      model,
      findManyArgs,
    });
    pageCursors.previous = previous;
  }
  return pageCursors;
}
