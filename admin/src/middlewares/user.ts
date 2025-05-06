module.exports = (config, { strapi }) => {
  return async (ctx: any, next: () => Promise<any>) => {
    if (ctx.request.method === 'POST' && ctx.request.path === '/admin/users') {
      await next(); // Wait strapi to finish creating the Admin user

      try {
        const { firstname, lastname, email } = ctx.request.body;

        const adminUser = await strapi.db.query('admin::user').findOne({
          where: { email },
        });

        if (!adminUser) {
          strapi.log.error('Admin user not found after creation.');
          return;
        }

        const existingProfile = await strapi.db
          .query('api::admin-profile.admin-profile')
          .findOne({
            where: { admin_user: adminUser.id },
          });

        if (existingProfile) {
          strapi.log.info('Admin profile already exists, skipping creation.');
          return;
        }

        await strapi.db.query('api::admin-profile.admin-profile').create({
          data: {
            full_name: `${firstname} ${lastname}`,
            admin_user: adminUser.id,
          },
        });

        strapi.log.info(`Admin profile created for ${firstname} ${lastname}.`);
      } catch (error) {
        strapi.log.error('Error creating admin profile:', error);
      }
    } else if (
      ctx.request.method === 'POST' &&
      ctx.request.path === '/admin/users/batch-delete'
    ) {
      // Step 1: Get the admin user IDs before deletion
      const adminsBefore = await strapi.db
        .query('admin::user')
        .findMany({ select: ['id'] });

      const adminIdsBefore = adminsBefore.map((u) => u.id);

      // Step 2: Get admin-profile IDs linked to those users
      const profilesLinked = await strapi.db
        .query('api::admin-profile.admin-profile')
        .findMany({
          where: {
            admin_user: { $in: adminIdsBefore },
          },
          populate: ['admin_user'],
        });

      // Map of admin_user.id -> profile.id
      const adminToProfileMap = new Map();
      for (const profile of profilesLinked) {
        if (profile.admin_user && profile.admin_user.id) {
          adminToProfileMap.set(profile.admin_user.id, profile.id);
        }
      }

      await next(); // Proceed with deletion

      // Step 3: Find which users got deleted
      const adminsAfter = await strapi.db
        .query('admin::user')
        .findMany({ select: ['id'] });

      const adminIdsAfter = adminsAfter.map((u) => u.id);

      const deletedAdminIds = adminIdsBefore.filter(
        (id) => !adminIdsAfter.includes(id)
      );

      // Step 4: Get corresponding profile IDs and delete them
      const profileIdsToDelete = deletedAdminIds
        .map((id) => adminToProfileMap.get(id))
        .filter(Boolean);

      if (profileIdsToDelete.length > 0) {
        await strapi.db.query('api::admin-profile.admin-profile').deleteMany({
          where: {
            id: { $in: profileIdsToDelete },
          },
        });

        strapi.log.info(
          `Deleted admin profiles: [${profileIdsToDelete.join(', ')}]`
        );
      }
    } else {
      await next();
    }
  };
};
