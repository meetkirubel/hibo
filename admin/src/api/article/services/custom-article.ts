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

    const [articles] = await Promise.all([
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
    ]);

    const total = articles.length;
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

  // Bookmark service
  async bookmark(ctx, userId, articleId) {
    // Find the user and article
    const user = await strapi
      .documents('plugin::users-permissions.user')
      .findOne({ documentId: userId });

    const article = await strapi
      .documents('api::article.article')
      .findOne({ documentId: articleId });

    if (!user || !article) {
      ctx.badRequest('User or Article not found');
    }

    // Add the article to the user's bookmarks
    const result = await strapi
      .documents('plugin::users-permissions.user')
      .update({
        documentId: userId,
        data: {
          bookmarks: {
            connect: [{ documentId: articleId }],
          },
        },
      });

    return result;
  },

  // Unbookmark service
  async unbookmark(ctx, userId, articleId) {
    // Find the user and article
    const user = await strapi
      .documents('plugin::users-permissions.user')
      .findOne({ documentId: userId });

    const article = await strapi
      .documents('api::article.article')
      .findOne({ documentId: articleId });

    if (!user || !article) {
      ctx.badRequest('User or Article not found');
    }

    // Add the article to the user's bookmarks
    const result = await strapi
      .documents('plugin::users-permissions.user')
      .update({
        documentId: userId,
        data: {
          bookmarks: {
            disconnect: [{ documentId: articleId }],
          },
        },
      });

    return result;
  },

  // Get all the bookmarks bookmarked by a user
  async getBookmarks(ctx, userId, page, limit) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    // Find the user by ID
    const user = await strapi
      .documents('plugin::users-permissions.user')
      .findOne({ documentId: userId, populate: { bookmarks: true } });

    if (!user) {
      ctx.badRequest('User not found');
    }

    // Check if the user has any bookmarks
    if (!user.bookmarks || user.bookmarks.length === 0) {
      return ctx.send({
        message: 'No bookmarks found',
        pagination: {
          page: pageNumber,
          pageSize,
          total: 0,
          pageCount: 0,
          hasNextPage: false,
        },
        bookmarks: [],
      });
    }
    // Calculate pagination variables
    const total = user.bookmarks.length; // Total number of bookmarks
    const pageCount = Math.ceil(total / pageSize); // Total pages
    const start = (pageNumber - 1) * pageSize; // Calculate starting index
    const end = start + pageSize; // Calculate end index

    // Get paginated bookmarks
    const paginatedBookmarks = user.bookmarks.slice(start, end);

    // Return the paginated bookmarks with pagination info
    return {
      pagination: {
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        total,
        pageCount,
        hasNextPage: end < total,
      },
      bookmarks: paginatedBookmarks,
    };
  },
};
