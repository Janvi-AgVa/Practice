const express = require('express')
const router = express.Router();
const {
    getAllRegisteredProjects,
    createNewProject,
    getProjectWithProjectCode,
    updateProjectWithProjectCode,
    addEmailWithProjectCode,
    getProjectDetails,
    
} = require('../controller/projects');
const {isAuth} = require('../middleware/authMiddleware');
router.get('/',isAuth,getAllRegisteredProjects);
router.post('/',isAuth,createNewProject)
router.get('/:projectCode',isAuth, getProjectWithProjectCode)
router.put('/:projectCode',isAuth, updateProjectWithProjectCode)
router.put('/updateEmail/:projectCode', addEmailWithProjectCode)
router.get('/getDeviceCount/:projectCode',isAuth,getProjectDetails)

module.exports = router;