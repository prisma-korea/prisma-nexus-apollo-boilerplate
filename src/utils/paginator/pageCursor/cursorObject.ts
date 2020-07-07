import { PrismaClient } from '@prisma/client';

interface Props<T, K> {
  page: number;
  pageInfo: {
    currentPage: number;
    size: number;
    totalPages: number;
  };
  model: K;
  findManyArgs: T;
}

export interface PageCursorType {
  cursor: string;
  page: number;
  isCurrent: boolean;
}

// Returns an opaque cursor for a page.
export async function pageToCursorObject<FindManyArgs>({
  page,
  pageInfo,
  model,
  findManyArgs,
}: Props<FindManyArgs, typeof model>): Promise<PageCursorType> {
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
