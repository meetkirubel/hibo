export default {
  async getRecentArticlesByCategory(ctx, query) {
    // Convert to integers
    const page = parseInt(query.pagination?.page, 10) || 1;
    const pageSize = parseInt(query.pagination?.pageSize, 10) || 25;
    const start = (page - 1) * pageSize;

    // Fetch all categories with the most recent article, applying pagination
    const [categories, total] = await Promise.all([
      strapi.documents('api::category.category').findMany({
        start,
        limit: pageSize,
        populate: {
          articles: {
            populate: {
              ...query?.populate,
            },
          },
        },
        sort: ['createdAt:desc'],
      }),
      strapi.documents('api::category.category').count({}),
    ]);

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
        ...recentArticle,
      };
    });

    // Return the paginated response
    return {
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      },
      data: result,
    };
  },
};
