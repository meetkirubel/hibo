export default {
  // Create a comment
  async create(ctx, user, comment, articleId) {
    // Find the article if it exists
    const article = await strapi
      .documents('api::article.article')
      .findOne({ documentId: articleId });

    if (!article) {
      ctx.throw(404, 'Article not found');
    }

    // Create a comment
    const result = await strapi.documents('api::comment.comment').create({
      data: {
        content: comment,
        commentor: user.documentId,
        article: articleId,
      },
    });

    return result;
  },

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
        select: ['documentId', 'content'],
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
        pageCount: Math.ceil(total / pageSize),
        hasNextPage: start + pageSize < total,
      },
      data: comments.map((comment) => ({
        documentId: comment.documentId,
        content: comment.content,
        article: comment.article.documentId,
        commentor: comment.commentor.username,
      })),
    };
  },
};
