import express from 'express'
import { createProjectConroller, getProjectTree } from '../../controllers/projectController.js';

const router = express.Router();

router.post('/',createProjectConroller)

router.get('/:projectId',getProjectTree);


export default router;