/**
 * ルーター
 */
import * as express from 'express';

import healthRouter from './health';
import projectsRouter from './projects';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

// 例外的なpublic router
router.use('/health', healthRouter);

router.use('/projects', projectsRouter);

export default router;
