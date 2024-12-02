import { Hono } from 'hono';

import { adminRouter } from './admin';
import { keywordFamilyRouter } from './keyword-family';
import { keywordRouter } from './keyword';
import { keywordFamilyRelationRouter } from './keyword-family-relation';
import { opinionRouter } from './opinion';
import { userRouter } from './user';
import { userProposedPollRouter } from './user-proposed-poll';
import { commentRouter } from './comment';
import { commentResponseRouter } from './comment-response';
import { energyPackageRouter } from './energy-package';
import { locationRouter } from './location';
import { pollRouter } from './poll';
import { analyticsRouter } from './analytics';
import { overviewRouter } from './overview';
import { userAuthMiddleware } from '@/middlewares';
import { handleMyNextPoll } from '@/controllers/poll.controller';

const app = new Hono();

export const routes = app
  .get('/health-check', (c) => {
    console.log('health check');
    return c.text('api working');
  })
  .get('/my-next-poll', userAuthMiddleware, handleMyNextPoll)
  .route('/user', userRouter)
  .route('/admin', adminRouter)
  .route('/keyword-family', keywordFamilyRouter)
  .route('/keyword', keywordRouter)
  .route('/keyword-family-relation', keywordFamilyRelationRouter)
  .route('/opinion', opinionRouter)
  .route('/user-proposed-poll', userProposedPollRouter)
  .route('/comment', commentRouter)
  .route('/comment-response', commentResponseRouter)
  .route('/energy-package', energyPackageRouter)
  .route('/location', locationRouter)
  .route('/poll', pollRouter)
  .route('/analytics', analyticsRouter)
  .route('/overview', overviewRouter);

export type AppType = typeof routes;
