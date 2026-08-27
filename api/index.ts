import { Router } from 'express';
import publicContentHandler from './public/content.js';
import publicCoursesHandler from './public/courses.js';
import publicNewsHandler from './public/news.js';
import publicApplicationsHandler from './public/applications.js';
import publicContactHandler from './public/contact.js';
import publicNewsletterHandler from './public/newsletter.js';
import authLoginHandler from './auth/login.js';
import authLogoutHandler from './auth/logout.js';
import authMeHandler from './auth/me.js';
import authProfileHandler from './auth/profile.js';
import adminUsersHandler from './admin/users.js';
import adminStatsHandler from './admin/stats.js';
import adminSettingsHandler from './admin/settings.js';
import adminCoursesHandler from './admin/courses.js';
import adminNewsHandler from './admin/news.js';
import adminEventsHandler from './admin/events.js';
import adminPublicationsHandler from './admin/publications.js';
import adminHeroHandler from './admin/hero.js';
import adminFeaturesHandler from './admin/features.js';
import adminPagesHandler from './admin/pages.js';
import adminApplicationsHandler from './admin/applications.js';
import adminMediaHandler from './admin/media.js';
import adminDatabaseHandler from './admin/database.js';
import healthHandler from './health.js';

const apiRouter = Router();

// Health
apiRouter.all('/api/health', healthHandler);

// Public Content & Routes
apiRouter.all('/api/public/content', publicContentHandler);
apiRouter.all('/api/public/courses', publicCoursesHandler);
apiRouter.all('/api/public/news', publicNewsHandler);
apiRouter.all('/api/public/applications', publicApplicationsHandler);
apiRouter.all('/api/public/contact', publicContactHandler);
apiRouter.all('/api/public/newsletter', publicNewsletterHandler);

// Auth
apiRouter.all('/api/auth/login', authLoginHandler);
apiRouter.all('/api/auth/logout', authLogoutHandler);
apiRouter.all('/api/auth/me', authMeHandler);
apiRouter.all('/api/auth/profile', authProfileHandler);

// Admin CMS
apiRouter.all('/api/admin/stats', adminStatsHandler);
apiRouter.all('/api/admin/users', adminUsersHandler);
apiRouter.all('/api/admin/settings', adminSettingsHandler);
apiRouter.all('/api/admin/courses', adminCoursesHandler);
apiRouter.all('/api/admin/news', adminNewsHandler);
apiRouter.all('/api/admin/events', adminEventsHandler);
apiRouter.all('/api/admin/publications', adminPublicationsHandler);
apiRouter.all('/api/admin/hero', adminHeroHandler);
apiRouter.all('/api/admin/features', adminFeaturesHandler);
apiRouter.all('/api/admin/pages', adminPagesHandler);
apiRouter.all('/api/admin/applications', adminApplicationsHandler);
apiRouter.all('/api/admin/media', adminMediaHandler);
apiRouter.all('/api/admin/database', adminDatabaseHandler);

export default apiRouter;
