import express from 'express'
import { createProjectConroller, getProjectTree, installDependenciesController } from '../../controllers/projectController.js';

const router = express.Router();

router.post('/',createProjectConroller)

router.get('/:projectId/tree',getProjectTree);
router.post('/:projectId/install', installDependenciesController);

export default router;
