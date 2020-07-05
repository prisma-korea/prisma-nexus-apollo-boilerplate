import { ErrorCursorOrCurrentPageArgNotGivenTogether } from './error';
import { PrismaClient } from '@prisma/client';
import { createPageCursors } from './pageCursor';

interface pageEdgeType {
  cursor: string,
  // eslint-disable-next-line
  node: Object,
}
interface pageCursorType {
  cursor: string,
  page: number,
  isCurrent: boolean,
}
interface paginationType {
  pageEdges: [pageEdgeType],
  pageCursors: {
    previous: pageCursorType,
    first: pageCursorType,
    arounds: [pageCursorType],
    last: pageCursorType,
  }
}

export async function createPageEdges<FindManyArgs, Delegate, WhereInput>({
  currentPage,
  cursor,
  size,
  buttonNum,
  orderBy,
  orderDirection,
  whereArgs,
  prisma,
  prismaModel,
}: {
  currentPage: number,
  cursor: string,
  size: number,
  buttonNum: number,
  orderBy: string,
  orderDirection: 'asc' | 'desc',
  whereArgs: WhereInput,
  prisma: PrismaClient,
  prismaModel: Delegate,
}): Promise<any> {
  if ((!cursor || !currentPage) && !(!cursor && !currentPage)) {
    throw ErrorCursorOrCurrentPageArgNotGivenTogether();
  }

  // totalRecords
  const postsAll = await prisma.post.findMany({
    where: {
      ...whereArgs,
    },
  });
  const totalRecords = postsAll.length;

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
    const idOrigin = Number(
      Buffer.from(cursor, 'base64').toString('ascii').slice(9),
    );
    findManyArgs = { ...findManyArgs, cursor: { id: idOrigin } };
  } else {
    const postsWithoutCursor = await prisma.post.findMany({
      ...findManyArgs,
    });
    const id = postsWithoutCursor[0].id;
    currentPage = 1;
    findManyArgs = { ...findManyArgs, cursor: { id: id } };
  }

  const posts = await prisma.post.findMany({
    ...findManyArgs,
  });
  const pageEdges = posts.map((post) => ({
    node: post,
    cursor: Buffer.from('saltysalt'.concat(String(post.id))).toString('base64'),
  }));
  const pageCursors = createPageCursors<FindManyArgs, Delegate>({
    pageInfo: {
      currentPage,
      size,
      buttonNum,
    },
    totalRecords,
    prismaModel,
    findManyArgs,
  });
  return {
    pageEdges,
    pageCursors,
  };
}
