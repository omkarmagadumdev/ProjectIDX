import express from 'express'
import { pingCheck } from '../../controllers/pingController.js';
import projectRouter from './project.js';

const router = express.Router();

router.use('/ping',pingCheck);

// Support singular `/project/:id` requests (some clients use singular path)
router.use('/project', projectRouter)

export default router;

