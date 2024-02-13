const Attendance = require('../models/Attendances');
const { Op  } = require('sequelize');
const updateCheckIn = async (req, res) => {
  const {  refId,userEmail, checkInTime } = req.body;
console.log("checkInTime::::::::::",checkInTime);
  try {
  
    const currentDate = new Date().toISOString().split('T')[0]; 

    console.log("currentDate:",currentDate);
    const existingData = await Attendance.findOne({ where: { refId, date: currentDate } });
    console.log(" existingData:", existingData);

    if (existingData) {
      await Attendance.update({ checkInTime }, { where: {  refId, date: currentDate } });
    }
     else {
      await Attendance.create({ refId, userEmail, date: currentDate, checkInTime,checkOutTime:'', hoursWorked :'',extraHoursWorked:''});
      
    }

    res.status(200).json({ success: true, message: 'CheckIn updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateCheckOut = async (req, res) => {
  const { refId, userEmail, checkOutTime, workingHours } = req.body;
  console.log("checkoutTime::::::::::", checkOutTime);
  try {
  
    const currentDate = new Date().toISOString().split('T')[0];

    console.log("currentDate:", currentDate);

    const existingData = await Attendance.findOne({ where: {  refId, date: currentDate } });
    console.log("existingData:", existingData);

    if (existingData) {
   
      const checkIn = new Date(existingData.checkInTime);
      const checkOut = new Date(checkOutTime);
      const timeDifference = checkOut.getTime() - checkIn.getTime();
      const hoursWorked = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesWorked = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      let formattedWorkingHours = '';
      let setWorkedHours,setWorkedMins ;
      if(hoursWorked>= workingHours){
        setWorkedHours = workingHours;
        setWorkedMins = 0; 
      }
      else{
        setWorkedHours = hoursWorked;
        setWorkedMins=minutesWorked ;
      }
      if (hoursWorked > 1) {
        formattedWorkingHours = `${setWorkedHours} hrs ${setWorkedMins} min`;
      } else {
        formattedWorkingHours = `${setWorkedHours} hr ${setWorkedMins} min`;
      }
      console.log("formattedWorkingHours:::::::::::::::::::::::", formattedWorkingHours);

      let extraHours ;
      let extraMinutes ;
      if(hoursWorked >=workingHours && minutesWorked >0 ){
        extraHours = workingHours - hoursWorked  ; 
        extraMinutes = minutesWorked;
      }
      else{
        extraHours = 0; 
        extraMinutes = 0;
      }
     

      let formattedExtraHoursWorked = '';

      if (extraHours > 1) {
        formattedExtraHoursWorked = `${extraHours} hrs ${extraMinutes} min`;
      } 
      else {
        formattedExtraHoursWorked = `${extraHours} hrs ${extraMinutes} min`;
      }

      console.log("formattedExtraHoursWorked:::::::::::::::::::::::", formattedExtraHoursWorked);

      await Attendance.update({ 
        checkOutTime, 
        hoursWorked: formattedWorkingHours, 
        extraHoursWorked: formattedExtraHoursWorked 
      }, { 
        where: {  refId, date: currentDate } 
      });
    } else {
      await Attendance.create({ 
        refId,
        userEmail, 
        date: currentDate, 
        checkInTime: '', 
        checkOutTime, 
        hoursWorked: '', 
        extraHoursWorked: '' 
      });
    }

    res.status(200).json({ success: true, message: 'CheckOut updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



const getCheckInCheckOut = async (req, res) => {
  const {  refId,userEmail } = req.body;
console.log("refIID",refId);
  try {
    const attendance = await Attendance.findOne({ where: {  refId } });
    console.log("Attendannnnnnnnnnnnnn:", attendance);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance data not found for the user.' });
    }

    const currentDate = new Date().toISOString().split('T')[0]; 
    console.log("CurrentDateeeeeeeeeeeeeeee:",currentDate);
    const todayData = await Attendance.findOne({ where: {  refId, date: currentDate } });
    console.log("Today's Attendance Data:", todayData);
    if (!todayData) {
      return res.status(200).json({ success: true, message: 'No attendance data for today.', checkInTime: null, checkOutTime: null });
    }

    const { checkInTime, checkOutTime } = todayData;
    res.status(200).json({ success: true, checkInTime, checkOutTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




const getAttendanceForCurrentMonth = async (req, res) => {
  const {refId } = req.body;

  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const attendance = await Attendance.findAll({
      where: {
        refId,
        date: {
          [Op.between]: [firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]]
        }
      }
    });

    let totalHoursWorked = 0;
    let totalExtraHoursWorked = 0;

    attendance.forEach(record => {
      const hoursWorkedSplit = record.hoursWorked.split(' ');
      const extraHoursWorkedSplit = record.extraHoursWorked.split(' ');

      totalHoursWorked += parseInt(hoursWorkedSplit[0]) + (parseInt(hoursWorkedSplit[2]) / 60);
      totalExtraHoursWorked += parseInt(extraHoursWorkedSplit[0]) + (parseInt(extraHoursWorkedSplit[2]) / 60);
    });

   
    const hoursUnit = totalHoursWorked > 1 ? 'hrs' : 'hr';
    const extraHoursUnit = totalExtraHoursWorked > 1 ? 'hrs' : 'hr';

   
    const totalHoursWorkedFormatted = `${Math.floor(totalHoursWorked)} ${hoursUnit} ${Math.round((totalHoursWorked % 1) * 60)} min`;
    const totalExtraHoursWorkedFormatted = `${Math.floor(totalExtraHoursWorked)} ${extraHoursUnit} ${Math.round((totalExtraHoursWorked % 1) * 60)} min`;

    console.log("Jan Month Attendance:::::::::", attendance);
    console.log(totalHoursWorkedFormatted,totalExtraHoursWorkedFormatted );
    res.status(200).json({ success: true,attendance, totalHoursWorked: totalHoursWorkedFormatted, totalExtraHoursWorked: totalExtraHoursWorkedFormatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



const getAttendanceBetweenDates = async (req, res) => {
  const {  refId, fromDate, toDate } = req.body;
  console.log("FromDate,ToDate:::::", fromDate, toDate);
  
  try {
    const attendance = await Attendance.findAll({
      where: {
        refId,
        date: {
          [Op.between]: [fromDate, toDate]
        }
      }
    });
    
    let totalHoursWorked = 0;
    let totalExtraHoursWorked = 0;

    attendance.forEach(record => {
      const hoursWorkedSplit = record.hoursWorked.split(' ');
      const extraHoursWorkedSplit = record.extraHoursWorked.split(' ');

      totalHoursWorked += parseInt(hoursWorkedSplit[0]) + (parseInt(hoursWorkedSplit[2]) / 60);
      totalExtraHoursWorked += parseInt(extraHoursWorkedSplit[0]) + (parseInt(extraHoursWorkedSplit[2]) / 60);
    });

    
    const hoursUnit = totalHoursWorked > 1 ? 'hrs' : 'hr';
    const extraHoursUnit = totalExtraHoursWorked > 1 ? 'hrs' : 'hr';

    
    const totalHoursWorkedFormatted = `${Math.floor(totalHoursWorked)} ${hoursUnit} ${Math.round((totalHoursWorked % 1) * 60)} min`;
    const totalExtraHoursWorkedFormatted = `${Math.floor(totalExtraHoursWorked)} ${extraHoursUnit} ${Math.round((totalExtraHoursWorked % 1) * 60)} min`;

    console.log("From To Date:::::", attendance);
    res.status(200).json({ success: true, attendance,totalHoursWorked: totalHoursWorkedFormatted, totalExtraHoursWorked: totalExtraHoursWorkedFormatted, attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





module.exports = {getCheckInCheckOut , getAttendanceBetweenDates,updateCheckOut , updateCheckIn, getAttendanceForCurrentMonth };



