
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const {updateCheckIn,updateCheckOut,getCheckInCheckOut,getAttendanceForCurrentMonth,getAttendanceBetweenDates} = attendanceController;

router.post('/updateCheckIn', updateCheckIn);
router.post('/updateCheckOut', updateCheckOut);
router.post('/getCheckInCheckOut', getCheckInCheckOut);
router.post('/getAttendanceForCurrentMonth',getAttendanceForCurrentMonth);
router.post('/getAttendanceBetweenDates',getAttendanceBetweenDates);

module.exports = router;
