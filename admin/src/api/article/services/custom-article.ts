export default {
  // Get all articles
  async getPaginatedArticles(userId, query) {
    const pageNumber = parseInt(query?.pagination?.page, 10) || 1;
    const pageSize = parseInt(query?.pagination?.pageSize, 10) || 25;
    const start = (pageNumber - 1) * pageSize;

    // Create the filters
    const filters: any = { approval_status: 'approved' };

    if (query.title) {
      filters.title = { $contains: query.title };
    }
    if (query.category) {
      filters.category = query.category;
    }
    if (query.subcategory) {
      filters.sub_category = query.subcategory;
    }
    if (query.locale) {
      filters.locale = query.locale;
    }
    if (query.tag) {
      filters.tag = {
        $contains: query.tag.trim(),
      };
    }
    if (query.is_featured) {
      filters.is_featured = query.is_featured;
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
          ...query?.populate,
          author: { fields: ['firstname', 'lastname'] },
          admin_profile: {
            fields: ['full_name'],
            populate: {
              profile: {
                fields: ['formats'],
              },
            },
          },
        },
      }),
      strapi.documents('api::article.article').count({ filters }),
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
      meta: {
        pagination: {
          page: pageNumber,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      },
      data: articles.map((article) => {
        const { content, admin_profile, ...rest } = article as any;

        return {
          ...rest,
          likedByCurrentUser: likedArticleIds.has(rest.documentId),
          admin_profile: {
            documentId: admin_profile?.documentId,
            full_name: admin_profile?.full_name,
            profile_image_url:
              admin_profile?.profile?.formats?.small?.url ?? null,
          },
        };
      }),
    };
  },

  //   Find by slug
  async getBySlug(ctx, userId, slug: string) {
    const result = await strapi.documents('api::article.article').findMany({
      filters: { slug, is_premium: true },
      limit: 1,
      populate: {
        image: { fields: 'formats' },
        category: { fields: ['name', 'slug'] },
        sub_category: { fields: 'name' },
        author: { fields: ['firstname', 'lastname'] },
        admin_profile: {
          fields: ['full_name'],
          populate: {
            profile: {
              fields: ['formats'],
            },
          },
        },
      },
    });

    if (!result || !result[0]) {
      return ctx.notFound('Article not found');
    }

    // Get likes for this article
    const like = await strapi.documents('api::like.like').findMany({
      filters: {
        user: { documentId: userId },
        article: { documentId: result[0].documentId },
      },
      populate: {
        article: {
          fields: 'id',
        },
      },
    });

    const { content, admin_profile, ...rest } = result[0] as any;
    if (!ctx.state?.user?.is_subscribed) {
      return {
        data: {
          ...rest,
          likedByCurrentUser: like.length > 0 ? true : false,
          author_profile: {
            documentId: admin_profile?.documentId,
            full_name: admin_profile?.full_name,
            profile_image_url:
              admin_profile?.profile?.formats?.small?.url ?? null,
          },
        },
      };
    }

    return {
      data: {
        ...rest,
        content,
        likedByCurrentUser: like.length > 0 ? true : false,
        author_profile: {
          documentId: admin_profile?.documentId,
          full_name: admin_profile?.full_name,
          profile_image_url:
            admin_profile?.profile?.formats?.small?.url ?? null,
        },
      },
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

    return { message: 'Article bookmarked successfully' };
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

    return { message: 'Article unbookmarked successfully' };
  },

  // Get all the bookmarks bookmarked by a user
  async getBookmarks(ctx, userId, query) {
    const pageNumber = parseInt(query.pagination?.page, 10) || 1;
    const pageSize = parseInt(query.pagination?.pageSize, 10) || 25;

    // Find the user by ID
    const user = await strapi
      .documents('plugin::users-permissions.user')
      .findOne({
        documentId: userId,
        populate: { bookmarks: true },
      });

    if (!user) {
      ctx.badRequest('User not found');
    }

    // Check if the user has any bookmarks
    if (!user.bookmarks) {
      return ctx.send({
        meta: {
          pagination: {
            page: pageNumber,
            pageSize,
            pageCount: 0,
            total: 0,
          },
        },
        data: [],
      });
    }
    // Calculate pagination variables
    const total = user.bookmarks.length;
    const pageCount = Math.ceil(total / pageSize);
    const start = (pageNumber - 1) * pageSize; // Calculate starting index
    const end = start + pageSize; // Calculate end index

    // Get paginated bookmarks
    const paginatedBookmarks = user.bookmarks.slice(start, end);

    // Return the paginated bookmarks with pagination info
    return {
      meta: {
        pagination: {
          page: pageNumber,
          pageSize,
          pageCount,
          total,
        },
      },
      data: paginatedBookmarks,
    };
  },
};
