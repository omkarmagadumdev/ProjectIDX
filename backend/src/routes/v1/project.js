import express from 'express'
import { createProjectConroller } from '../../controllers/projectController.js';

const router = express.Router();

router.post('/',createProjectConroller)

export default router;