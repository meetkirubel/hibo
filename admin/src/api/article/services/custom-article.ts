export default {
  // Get all articles
  async getPaginatedArticles({
    userId,
    page,
    limit,
    search,
    category,
    subcategory,
    tag,
    locale,
    is_featured,
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

    if (is_featured) {
      filters.is_featured = is_featured;
    }

    const [articles, total] = await Promise.all([
      strapi.documents('api::article.article').findMany({
        where: filters,
        select: [
          'documentId',
          'title',
          'slug',
          'excerpt',
          'is_premium',
          'like_count',
          'is_featured',
          'reading_time',
          'tag',
          'updatedAt',
          'content',
        ],
        start,
        limit: pageSize,
        orderBy: { createdAt: 'desc' },
        populate: {
          image: { fields: 'url' },
          category: { fields: 'name' },
          sub_category: { fields: 'name' },
          author: { fields: ['firstname', 'lastname'] },
        },
      }),
      strapi.query('api::article.article').count({ where: filters }),
    ]);

    return {
      pagination: {
        page: pageNumber,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize),
        hasNextPage: start + pageSize < total,
      },
      data: articles.map((article) => ({
        documentId: article.documentId,
        title: article.title,
        author: article.author ? article.author : null,
        slug: article.slug,
        featured_image: article.image ? article.image.url : null,
        excerpt: article.excerpt,
        reading_time: article.reading_time,
        tag: article.tag
          ? article.tag.split(',').map((tag) => tag.trim())
          : null,
        is_premium: article.is_premium,
        like: article.like_count,
        is_featured: article.is_featured,
        updated_at: article.updatedAt,
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
