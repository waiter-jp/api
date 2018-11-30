/**
 * ルーター
 */
import * as express from 'express';

import projectsRouter from './projects';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.use('/projects', projectsRouter);

export default router;
