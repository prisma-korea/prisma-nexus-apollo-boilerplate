import { ErrorCursorOrCurrentPageArgNotGivenTogether } from './pageError';
import { createPageCursors } from './pageCursor';

interface pageEdgeType {
  cursor: string,
  /* eslint-disable */
  user: Object,
  post: Object,
  node: Object,
  /* eslint-enable */
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
  modelType,
  currentPage,
  cursor,
  size,
  buttonNum,
  orderBy,
  orderDirection,
  whereArgs,
  prismaModel,
}: {
  modelType: string,
  currentPage: number,
  cursor: string,
  size: number,
  buttonNum: number,
  orderBy: string,
  orderDirection: 'asc' | 'desc',
  whereArgs: WhereInput,
  prismaModel: Delegate,
}): Promise<any> {
  if ((!cursor || !currentPage) && !(!cursor && !currentPage)) {
    throw ErrorCursorOrCurrentPageArgNotGivenTogether();
  }

  // totalCount
  // @ts-ignore
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
    // @ts-ignore
    const resultsForCursor = await prismaModel.findMany({
      ...findManyArgs,
      take: 1,
    });
    const id = resultsForCursor[0].id;
    currentPage = 1;
    findManyArgs = { ...findManyArgs, cursor: { id: id } };
  }

  // @ts-ignore
  const resultsForEdges = await prismaModel.findMany({
    ...findManyArgs,
  });
  const pageEdges = resultsForEdges.map((result) => ({
    [modelType]: result,
    cursor: Buffer.from('saltysalt'.concat(String(result.id))).toString('base64'),
  }));

  const pageCursors = createPageCursors<FindManyArgs, Delegate>({
    pageInfo: {
      currentPage,
      size,
      buttonNum,
    },
    totalCount,
    prismaModel,
    findManyArgs,
  });

  return {
    pageEdges,
    pageCursors,
  };
}
