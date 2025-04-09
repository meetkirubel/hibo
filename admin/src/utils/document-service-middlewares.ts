import slugify from 'slugify';
import { capitalize, calculateReadingTime } from './helper-functions';

const pageTypes = ['api::article.article'];
const pageActions = ['create', 'update'];

const contentMiddleware = () => {
  return async (context, next) => {
    // Early return if the document type or action is not valid
    if (
      !pageTypes.includes(context.uid) ||
      !pageActions.includes(context.action)
    ) {
      return await next();
    }

    const { data } = context.params;
    let title = data.title;
    let content = data.content;

    // Capitilize the title
    if (title) {
      context.params.data.title = capitalize(title);
    }

    // Generate slug
    let Stitle = data.title || '';
    Stitle = Stitle.replace(/[^A-Za-z0-9_.~]+/g, ' ');
    // Generate slug
    let slug = slugify(Stitle, {
      lower: true,
      trim: true,
    });

    // Trim unwanted trailing/leading symbols (-, ., _, ~)
    slug = slug.replace(/^[-._~]+|[-._~]+$/g, '');

    // Assign it
    context.params.data.slug = slug;

    // Calculate reading time
    if (content) {
      context.params.data.reading_time = calculateReadingTime(content);
    }

    // Call the next middleware in the stack
    return await next();
  };
};

export { contentMiddleware };
