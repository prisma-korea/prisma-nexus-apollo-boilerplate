// In most cases Service caps the pagination results to 100 pages
// and we may not want to return more than that
const PAGE_NUMBER_CAP = 100;

// Returns an opaque cursor for a page.
async function pageToCursorObject<FindManyArgs, Delegate>(
  page: number,
  pageInfo: {
     currentPage: number,
     size: number,
     totalPages: number,
  },
  prismaModel: Delegate,
  findManyArgs: FindManyArgs,
) {
  const { currentPage, size, totalPages } = pageInfo;
  let cursorId: number | string;

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
    // @ts-ignore
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
    // @ts-ignore
    const result = await prismaModel.findMany({
      ...findManyArgsForLast,
      take: 1,
    });
    cursorId = result[0].id;

  // arounds & previous
  } else {
    const distance = (page - currentPage) * size;
    const takeSkipArgs = {
      take: distance < 0 ? -1 : 1,
      skip: distance < 0 ? distance * -1 : distance,
    };
    // @ts-ignore
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

// Returns an array of PageCursor objects
// from start to end (page numbers).
async function pageCursorsToArray<FindManyArgs, Delegate>(
  start: number,
  end: number,
  pageInfo: {
    currentPage: number,
    size: number,
    totalPages: number,
  },
  prismaModel: Delegate,
  findManyArgs: FindManyArgs,
) {
  let page;
  const cursors = [];
  for (page = start; page <= end; page++) {
    const cursorResult = await pageToCursorObject<FindManyArgs, Delegate>(
      page,
      pageInfo,
      prismaModel,
      findManyArgs,
    );
    cursors.push(cursorResult);
  }
  return cursors;
}

// Returns the total number of pagination results capped to PAGE_NUMBER_CAP.
export function computeTotalPages(totalCount:number, size: number): number {
  return Math.min(Math.ceil(totalCount / size), PAGE_NUMBER_CAP);
}

interface pageCursor {
  cursor: number,
  page: number,
  isCurrent: boolean,
}

interface pageCursors {
  first: pageCursor,
  around: [pageCursor],
  last: pageCursor,
}

export async function createPageCursors<FindManyArgs, Delegate>({
  pageInfo: { currentPage, size, buttonNum },
  totalCount,
  prismaModel,
  findManyArgs,
}: {
  pageInfo: {
    currentPage: number,
    size: number,
    buttonNum: number,
  },
  totalCount: number,
  prismaModel: Delegate,
  findManyArgs: FindManyArgs,
}): Promise<pageCursors> {
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
    // pageCursors = { around: [pageToCursorObject<T, K>(1, 1, size, prismaModel, where)] };
    pageCursors = {
      around: [],
    };
  } else if (totalPages <= buttonNum) {
    // Collection is short, and `around` includes page 1 and the last page. 1 / 1 2 3 / 7
    const around = await pageCursorsToArray<FindManyArgs, Delegate>(1, totalPages, pageInfo, prismaModel, findManyArgs);
    pageCursors = {
      around,
    };
  } else if (currentPage <= Math.floor(buttonNum / 2) + 1) {
    // We are near the beginning, and `around` will include page 1. 1 / 1 2 3 / 7
    const last = await pageToCursorObject<FindManyArgs, Delegate>(totalPages, pageInfo, prismaModel, findManyArgs);
    const around = await pageCursorsToArray<FindManyArgs, Delegate>(
      1,
      buttonNum - 1,
      pageInfo,
      prismaModel,
      findManyArgs,
    );
    pageCursors = {
      last,
      around,
    };
  } else if (currentPage >= totalPages - Math.floor(buttonNum / 2)) {
    // We are near the end, and `around` will include the last page. 1 / 5 6 7 / 7
    const first = await pageToCursorObject<FindManyArgs, Delegate>(1, pageInfo, prismaModel, findManyArgs);
    const around = await pageCursorsToArray<FindManyArgs, Delegate>(
      totalPages - buttonNum + 2,
      totalPages,
      pageInfo,
      prismaModel,
      findManyArgs,
    );
    pageCursors = {
      first,
      around,
    };
  } else {
    // We are in the middle, and `around` doesn't include the first or last page. 1 / 4 5 6 / 7
    const first = await pageToCursorObject<FindManyArgs, Delegate>(1, pageInfo, prismaModel, findManyArgs);
    const last = await pageToCursorObject<FindManyArgs, Delegate>(totalPages, pageInfo, prismaModel, findManyArgs);
    const offset = Math.floor((buttonNum - 3) / 2);
    const around = await pageCursorsToArray<FindManyArgs, Delegate>(
      currentPage - offset,
      currentPage + offset,
      pageInfo,
      prismaModel,
      findManyArgs,
    );
    pageCursors = {
      first,
      around,
      last,
    };
  }
  if (currentPage > 1 && totalPages > 1) {
    const previous = await pageToCursorObject<FindManyArgs, Delegate>(
      currentPage - 1,
      pageInfo,
      prismaModel,
      findManyArgs,
    );
    pageCursors.previous = previous;
  }
  return pageCursors;
}
