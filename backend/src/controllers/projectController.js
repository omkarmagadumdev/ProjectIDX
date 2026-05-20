import { createProjectService, getProgectTreeService } from '../service/projectService.js';

export const createProjectConroller = async (req, res) => {
  console.log('createProjectConroller: received request')
  try {
    const projectId = await createProjectService()
    console.log('createProjectConroller: created', projectId)
    return res.json({ message: 'Project created', data: projectId })
  } catch (err) {
    console.error('createProjectConroller error', err)
    return res.status(500).json({ message: 'error', error: String(err) })
  }
}

export const getProjectTree = async (req, res) => {
  const tree = await getProgectTreeService(req.params.projectId)
  return res.status(200).json({
    data: tree,
    success: true,
    message: "Successfully fetched the tree"
  })
}
