
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require("../middlewares/multerConfig");
const { register, applyLeave, getAllEmployees, getLeaveData, getAllEmployeesDepartment, getTeamMembers,deleteTeamMembers , saveTeamMembers,updateManagerProfile,updateEmployeeProfile, getLeaveDataCount,updateLeaveAvailable,getLeaveDataPending,updateLeaveStatusById,getLeaveDataApproved,getLeaveDataRejected,getLeaveDataByDateRange,getUserProfile,updateLeaveApplication,deleteEmployee} = userController;

router.get('/leave-data', getLeaveData);
router.get('/leave-data-pending', getLeaveDataPending);
router.get('/leave-data-approved', getLeaveDataApproved);
router.get('/leave-data-rejected', getLeaveDataRejected);
router.get('/leave-data-count', getLeaveDataCount);
router.get('/get-all-employees-department', getAllEmployeesDepartment);
router.get('/get-all-employees', getAllEmployees);
router.get('/get-team-members', getTeamMembers);
router.get('/leave-data-range', getLeaveDataByDateRange);
router.get('/get-user-profile/:refId', getUserProfile);

router.post('/save-team-members', saveTeamMembers);
router.post('/register', register);
router.post('/leave-application',applyLeave);

router.put('/update-manager-profile/:refId', upload.single('image'), updateManagerProfile);
router.put('/update-employee-profile/:refId', upload.single('image'), updateEmployeeProfile);
router.put('/update-leave-available', updateLeaveAvailable);
router.put('/update-leave-application', updateLeaveApplication);
router.put('/update-leave-status', updateLeaveStatusById);

router.delete('/delete-team-member', deleteTeamMembers );
router.delete('/delete-employee/:employeeRefId', deleteEmployee);

module.exports = router;
