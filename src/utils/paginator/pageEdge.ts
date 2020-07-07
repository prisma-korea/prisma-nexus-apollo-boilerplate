import { ErrorCursorOrCurrentPageArgNotGivenTogether } from './pageError';
import { PrismaClient } from '@prisma/client';
import { createPageCursors } from './pageCursor';

interface PageEdgeType<T> {
  cursor: string,
  node: T,
}
interface PageCursorType {
  cursor: string,
  page: number,
  isCurrent: boolean,
}
interface PaginationType<T> {
  pageEdges: [PageEdgeType<T>],
  pageCursors: {
    previous: PageCursorType,
    first: PageCursorType,
    around: [PageCursorType],
    last: PageCursorType,
  }
}

interface Props<T, K> {
  model: K,
  currentPage: number,
  cursor: string,
  size: number,
  buttonNum: number,
  orderBy: string,
  orderDirection: 'asc' | 'desc',
  whereArgs: T,
}

export async function cursorBasedOffsetPaginator<FindManyArgs, WhereInput>({
  model,
  currentPage,
  cursor,
  size,
  buttonNum,
  orderBy,
  orderDirection,
  whereArgs,
}: Props<WhereInput, typeof model>): Promise<PaginationType<typeof model>> {
  if ((!cursor || !currentPage) && !(!cursor && !currentPage)) {
    throw ErrorCursorOrCurrentPageArgNotGivenTogether();
  }

  // totalCount
  const prisma = new PrismaClient();
  const prismaModel = prisma[model.name.toLowerCase()];
  const totalCount = await prismaModel.count({
    where: {
      ...whereArgs,
    },
  });

  // findManyArgs
  let findManyArgs: FindManyArgs;
  if (whereArgs) {
    findManyArgs = { ...findManyArgs, where: { ...whereArgs } };
  }
  if (size) {
    findManyArgs = { ...findManyArgs, take: size };
  }
  if (orderBy) {
    findManyArgs = { ...findManyArgs, orderBy: { [orderBy]: orderDirection } };
  }
  if (cursor) {
    const decryptedCursor = Buffer.from(cursor, 'base64').toString('ascii').slice(9);
    let idOrigin: number | string;
    if (isNaN(parseInt(decryptedCursor))) {
      idOrigin = decryptedCursor;
    } else {
      idOrigin = Number(decryptedCursor);
    }
    findManyArgs = { ...findManyArgs, cursor: { id: idOrigin } };
  } else {
    const resultsForCursor = await prismaModel.findMany({
      ...findManyArgs,
      take: 1,
    });
    const id = resultsForCursor[0].id;
    currentPage = 1;
    findManyArgs = { ...findManyArgs, cursor: { id: id } };
  }

  const resultsForEdges = await prismaModel.findMany({
    ...findManyArgs,
  });
  const pageEdges = resultsForEdges.map((result) => ({
    cursor: Buffer.from('saltysalt'.concat(String(result.id))).toString('base64'),
    node: result,
  }));

  const pageCursors = await createPageCursors<FindManyArgs>({
    pageInfo: {
      currentPage,
      size,
      buttonNum,
    },
    model,
    findManyArgs,
    totalCount,
  });

  return {
    pageEdges,
    pageCursors,
  };
}
