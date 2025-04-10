export default {
  async toggle(ctx, articleId, userId, action) {
    // Find the article if it exists
    const article = await strapi
      .documents('api::article.article')
      .findOne({ documentId: articleId });

    if (!article) {
      ctx.throw(404, 'Article not found');
    }

    // Check if the user already has liked an article
    const existingLike = await strapi.documents('api::like.like').findFirst({
      filters: {
        article: { documentId: articleId },
        user: { documentId: userId },
      },
    });

    // Check if the user has already liked the article
    if (action === 'like') {
      if (existingLike) {
        ctx.throw(409, 'User has already like this article');
      }

      // Create the like and the relationship
      await strapi.documents('api::like.like').create({
        data: {
          article: articleId,
          user: userId,
          liked: true,
        },
      });

      // Increament the like count
      await strapi.documents('api::article.article').update({
        documentId: articleId,
        data: {
          like_count: article.like_count + 1,
        },
      });

      return { message: 'Article liked successfully' };
    }

    // Check if the user hasn't liked the article yet
    if (action === 'unlike') {
      if (!existingLike) {
        ctx.throw(409, 'User has not liked this article yet');
      }

      // Delete the like
      await strapi
        .documents('api::like.like')
        .delete({ documentId: existingLike.documentId });

      // Decreament the like count
      await strapi.documents('api::article.article').update({
        documentId: articleId,
        data: {
          like_count: article.like_count - 1,
        },
      });

      return { message: 'Article unliked successfully' };
    }

    return ctx.throw(400, 'Invalid action');
  },
};
