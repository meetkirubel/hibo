export default {
  // Get all comments
  async commentsForArticle(page, limit, articleId) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const start = (pageNumber - 1) * pageSize;

    const filters: any = {
      approval_status: 'approved',
      article: { documentId: articleId },
    };

    const [comments, total] = await Promise.all([
      strapi.documents('api::comment.comment').findMany({
        where: filters,
        select: ['documentId', 'approval_status', 'content', 'locale'],
        start,
        limit: pageSize,
        orderBy: { createdAt: 'desc' },
        populate: {
          commentor: { fields: ['username'] },
          article: { fields: 'title' },
        },
      }),
      strapi.query('api::comment.comment').count({ where: filters }),
    ]);

    return {
      pagination: {
        page: pageNumber,
        pageSize,
        total,
        hasNextPage: pageNumber * pageSize < total,
      },
      data: comments.map((comment) => ({
        documentId: comment.documentId,
        approval_status: comment.approval_status,
        content: comment.content,
        locale: comment.locale,
        article: comment.article.documentId,
        commentor: comment.commentor.username,
      })),
    };
  },
};
