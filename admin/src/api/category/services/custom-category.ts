function formatLikeCount(number) {
  if (number >= 1000) {
    return Math.floor(number / 1000) + 'K';
  }
  return number.toString();
}

export default {
  async getRecentArticlesByCategory(ctx, page, pageSize) {
    // Convert to integers
    const pageNumber = parseInt(page, 10) || 1;
    const pageSizeParsed = parseInt(pageSize, 10) || 10;
    const start = (pageNumber - 1) * pageSizeParsed;

    // Fetch all categories with the most recent article, applying pagination
    const [categories] = await Promise.all([
      strapi.documents('api::category.category').findMany({
        start,
        limit: pageSizeParsed,
        populate: {
          articles: {
            populate: {
              image: { fields: 'url' },
              author: { fields: ['firstname', 'lastname'] },
            },
          },
        },
        sort: ['createdAt:desc'],
      }),
    ]);
    const total = categories.length;

    // Map the categories to include only the most recent article from each category
    const result = categories.map((category) => {
      const recentArticle =
        category.articles.length > 0
          ? category.articles.sort((a: any, b: any) => {
              const ab: any = new Date(b.createdAt);
              const ac: any = new Date(a.createdAt);

              return ab - ac;
            })[0]
          : null;

      return {
        categoryName: category.name,
        documentId: recentArticle.documentId,
        title: recentArticle.title,
        author: recentArticle.author
          ? `${recentArticle.author.firstname} ${recentArticle.author.lastname}`
          : null,
        slug: recentArticle.slug,
        featured_image: recentArticle.image ? recentArticle.image.url : null,
        excerpt: recentArticle.excerpt,
        is_premium: recentArticle.is_premium,
        is_featured: recentArticle.is_featured,
        content: recentArticle.content,
      };
    });

    // Return the paginated response
    return {
      pagination: {
        page: pageNumber,
        pageSize: pageSizeParsed,
        total,
        pageCount: Math.ceil(total / pageSizeParsed),
        hasNextPage: start + pageSizeParsed < total,
      },
      data: result,
    };
  },
};
