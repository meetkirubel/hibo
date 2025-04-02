export default {
  // Get all articles
  async getPaginatedArticles({
    page,
    limit,
    search,
    category,
    subcategory,
    tag,
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

    if (tag) {
      filters.tag = {
        $contains: tag.trim(),
      };
    }

    const [articles, total] = await Promise.all([
      strapi.documents('api::article.article').findMany({
        where: filters,
        select: [
          'documentId',
          'title',
          'slug',
          'excerpt',
          'approval_status',
          'is_premium',
          'reading_time',
          'view_count',
          'tag',
          'content',
        ],
        start,
        limit: pageSize,
        orderBy: { createdAt: 'desc' },
        populate: {
          image: { fields: 'url' },
          category: { fields: 'name' },
          sub_category: { fields: 'name' },
          author: { fields: 'username' },
        },
      }),
      strapi.query('api::article.article').count({ where: filters }),
    ]);

    return {
      pagination: {
        page: pageNumber,
        pageSize,
        total,
        hasNextPage: start + pageSize < total,
      },
      data: articles.map((article) => ({
        documentId: article.documentId,
        title: article.title,
        slug: article.slug,
        image_url: article.image ? article.image.url : null,
        excerpt: article.excerpt,
        reading_time: article.reading_time,
        tag: article.tag.split(',').map((tag) => tag.trim()),
        is_premium: article.is_premium,
        view_count: article.view_count,
        approval_status: article.approval_status,
        content: article.content,
      })),
    };
  },

  // Get article by its slug
  async getArticle(slug) {
    const article = await strapi
      .documents('api::article.article')
      .findFirst(slug);

    return article;
  },
};
