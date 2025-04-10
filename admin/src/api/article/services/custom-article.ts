function formatLikeCount(number) {
  if (number >= 1000) {
    return Math.floor(number / 1000) + 'K';
  }
  return number.toString();
}

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
    slug,
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

    if (slug) {
      filters.slug = slug;
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
        sort: { createdAt: 'desc' },
        populate: {
          image: { fields: 'url' },
          category: { fields: 'name' },
          sub_category: { fields: 'name' },
          author: { fields: ['firstname', 'lastname'] },
        },
      }),
      strapi.query('api::article.article').count({ where: filters }),
    ]);

    const articleIds = articles.map((article) => article.documentId);

    // Fetch all likes for the current user for these articles
    const userLikes = await strapi.documents('api::like.like').findMany({
      filters: {
        user: { documentId: userId },
        article: { documentId: { $in: articleIds } },
      },
      populate: {
        article: {
          fields: 'id',
        },
      },
    });

    const likedArticleIds = new Set(
      userLikes.map((like) => like.article.documentId)
    );

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
        likedByCurrentUser: likedArticleIds.has(article.documentId),
        likes: formatLikeCount(article.like_count),
        is_featured: article.is_featured,
        updated_at: article.updatedAt,
        content: article.content,
      })),
    };
  },
};
