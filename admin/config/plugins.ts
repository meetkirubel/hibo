export default ({ env }) => ({
  // Allow additional field addition in the registration form
  'users-permissions': {
    config: {
      email_confirmation: true,
      email_confirmation_redirection: 'https://www.upwork.com',
      jwt: {
        expiresIn: '30d',
      },
      register: {
        // Add the fields you want to accept here
        allowedFields: [
          'firstName',
          'lastName',
          'username',
          'email',
          'password',
        ],
      },
    },
  },

  // Email provider
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: env('ADDRESS_FROM'),
        defaultReplyTo: env('ADDRESS_REPLY'),
      },
    },
  },
});
