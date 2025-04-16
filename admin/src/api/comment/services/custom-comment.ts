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
  async commentsForArticle(articleId, query) {
    const pageNumber = parseInt(query.pagination?.page, 10) || 1;
    const pageSize = parseInt(query.pagination?.pageSize, 10) || 25;
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
          ...query?.populate,
        },
      }),
      strapi.documents('api::comment.comment').count({ filters }),
    ]);

    return {
      meta: {
        pagination: {
          page: pageNumber,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      },
      data: comments,
    };
  },
};
