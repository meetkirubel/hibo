export default {
  // Get all articles
  async getPaginatedArticles({
    page,
    limit,
    search,
    category,
    subcategory,
    locale,
  }) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const start = (pageNumber - 1) * pageSize;

    const filters: any = { approval_status: 'approved' };

    if (search) {
      filters.title = { $contains: search };
    }

    if (category) {
      filters.category = category;
    }

    if (subcategory) {
      filters.subcategory = subcategory;
    }

    if (locale) {
      filters.locale = locale;
    }

    const [articles, total] = await Promise.all([
      strapi.documents('api::article.article').findMany({
        where: filters,
        offset: start,
        limit: pageSize,
        orderBy: { createdAt: 'desc' },
        populate: ['category', 'sub_category'],
      }),
      strapi.documents('api::article.article').count(filters),
    ]);

    return {
      articles,
      pagination: {
        page: pageNumber,
        pageSize,
        total,
        hasNextPage: start + pageSize < total,
      },
    };
  },
};
