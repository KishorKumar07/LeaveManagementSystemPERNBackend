const { User,TeamMember } = require('../models/user.js');
const LeaveApplication = require("../models/LeaveApplication")
const { Sequelize,Op, EagerLoadingError  } = require('sequelize');
const moment = require('moment');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  console.log('Received data:', req.body);

  const { refId, name, email, password, role, department } = req.body;

  try {
    const existingUser = await User.findOne({ where: { refId } });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already existed' });
    }

   
    const newUser = await User.create({ refId, name, email, password, role, department });

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
const getAllEmployeesDepartment = async (req, res) => {
  try {
    const { department, refId } = req.query;

    const manager = await User.findOne({ where: { refId } });
  
    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const teamMembers = await TeamMember.findAll({ where: { managerRefId: refId } });
    console.log("teamMembers::", teamMembers);

    const employees = await User.findAll({
      where: { department, role: 'Employee' },
      include: [{ model: TeamMember, as: 'teamMembers', attributes: ['email'] }], 
      raw: true,
      nest: true,
      attributes: { exclude: ['password'] },
    });
  
    // Filter out employees who are already team members of the manager
    const filteredEmployees = employees.filter(employee =>
      !teamMembers.some(member => member.email === employee.email)
    );

    res.json({ employees: filteredEmployees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getTeamMembers = async (req, res) => {
  const { refId } = req.query;

  try {
    const manager = await User.findOne({ where: { refId } });

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const teamMembers = await TeamMember.findAll({ where: { managerRefId: refId } });

    // Filter out duplicate team members based on email address
    const uniqueTeamMembers = teamMembers.filter((member, index, self) =>
      index === self.findIndex(m => m.email === member.email)
    );

    console.log("teamMembers:", uniqueTeamMembers);
    res.status(200).json({ success: true, teamMembers: uniqueTeamMembers });
  } catch (error) {
    console.error('Error fetching team members: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const saveTeamMembers = async (req, res) => {
  const { refId, email, name, teamMembers } = req.body;
  console.log('Received  data:', { email, name, teamMembers }); 
  try {
    const user = await User.findOne({ where: { refId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    await Promise.all(
      teamMembers.map(async (teamMember) => {
       
        await TeamMember.create(teamMember);
        const teamMemberUser = await User.findOne({ where: { refId: teamMember.refId } });
        console.log("teamMember ::",teamMemberUser);
        if (teamMemberUser) {
          await teamMemberUser.update({ teamLeadName: name, teamLeadEmail: email, managerRefId : refId});
        }
      })
    );

    res.status(200).json({ success: true, message: 'Team members saved successfully' });
  } catch (error) {
    console.error('Error saving team members:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteTeamMembers = async (req, res) => {
  const { refId, employeeRefId } = req.query;

  try {
    const manager = await User.findOne({ where: { refId } });

    if (manager) {
      const teamMemberToDelete = await TeamMember.findOne({ 
        where: { refId: employeeRefId, managerRefId: refId } 
      });

      if (teamMemberToDelete) {
        await teamMemberToDelete.destroy();
        res.status(200).json({ success: true, message: 'Team member deleted successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Team member not found' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Manager not found' });
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const updateManagerProfile = async (req, res) => {
  const { email, name } = req.body;
  const refId = req.params.refId;
  console.log("refffffiddd", refId);
  try {
    let imageData = null; // Corrected variable name

    if (req.file && req.file.buffer) {
      imageData = req.file.buffer;
    }

    console.log("imagePathghhhhhhhhhhhh:", imageData);

    const updatedManager = await User.update(
      { name: name, email: email, image_data: imageData },
      { where: { refId } }
    );

    res.json({ updatedManager });
  } catch (error) {
    console.error('Error updating manager profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateEmployeeProfile = async (req, res) => {
  const { email, name } = req.body;
  const refId = req.params.refId;
  console.log("refffffiddd", refId);
  try {
    let imageData = null;

    if (req.file && req.file.buffer) {
      imageData = req.file.buffer;
    }

    console.log("imageData:", imageData);

    const updatedEmployee = await User.update(
      { name: name, email: email, image_data: imageData },
      { where: { refId: refId } }
    );
    console.log("UP:", updatedEmployee);
    res.json({ updatedEmployee });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const getUserProfile = async (req, res) => {
  const { refId} = req.params;
  
  try {
   
    const userProfile = await User.findOne({ where: {refId} });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const applyLeave = async (req, res) => {
  const {refId,managerRefId, name, image, email, teamLeadEmail, department, startDate, endDate, noOfDays, leaveType, reason, leaveStatus } = req.body;
  console.log('Received leave application:', {refId,managerRefId, name, image, email, teamLeadEmail, department, startDate, endDate, noOfDays, leaveType, reason, leaveStatus });

  try {
  
    await LeaveApplication.create({
      refId,
      managerRefId,
      name,
      image,
      email,
      teamLeadEmail,
      department,
      startDate,
      endDate,
      noOfDays,
      leaveType,
      reason,
      leaveStatus
    });

    res.status(200).json({ success: true, message: 'Leave application received successfully' });
  } catch (error) {
    console.error('Error saving leave application:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getLeaveDataCount = async (req, res) => {
  const { refId } = req.query;

  try {
    const leaveData = await LeaveApplication.findAll({ where: { refId } });
   
    res.status(200).json({ success: true, leaveData });
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getLeaveDataByDateRange = async (req, res) => {
  const {department} = req.query;

  try {
    const today = moment().format('DD MMM YYYY');
    const thisWeekStart = moment().startOf('week').format('DD MMM YYYY');
    const nextWeekStart = moment().startOf('week').add(1, 'weeks').format('DD MMM YYYY');

    const todayData = await LeaveApplication.findAll({ where: { department, startDate: today } });
    const thisWeekData = await LeaveApplication.findAll({ where: { department, startDate: { [Op.between]: [thisWeekStart, today] } } });
    const nextWeekData = await LeaveApplication.findAll({ where: { department, startDate: { [Op.gte]: nextWeekStart } } });

    const result = {
      today: todayData,
      thisWeek: thisWeekData,
      nextWeek: nextWeekData,
    };

    res.status(200).json({ success: true, leaveData: result });
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const updateLeaveAvailable = async (req, res) => {
  const { refId, leaveAvailable } = req.body;

  try {
    await LeaveApplication.update({ leaveAvailable: leaveAvailable }, { where: { refId } });

    res.json({ success: true, message: 'Leave available updated successfully' });
  } catch (error) {
    console.error('Error updating leave available:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getLeaveDataPending = async (req, res) => {
  const {managerRefId, leaveStatus } = req.query;

  try {
    console.log('Team Lead RefId:', managerRefId);

    const leaveData = await LeaveApplication.findAll({
      where: {
        managerRefId,
        leaveStatus,
      },
    });

    console.log('Leave Data:', leaveData);

    res.status(200).json({ success: true, leaveData });
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getLeaveDataApproved = async (req, res) => {
  const { managerRefId} = req.query;
  const leaveStatus = 'Approved'; 

  try {
    console.log('Team Lead RefId:', managerRefId);

    const leaveData = await LeaveApplication.findAll({
      where: {
        managerRefId,
        leaveStatus,
      },
    });

    console.log('Leave Data:', leaveData);

    res.status(200).json({ success: true, leaveData });
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getLeaveDataRejected = async (req, res) => {
  const { managerRefId} = req.query;
  const leaveStatus = 'Rejected'; 

  try {
    console.log('Team Lead refId:', managerRefId);

    const leaveData = await LeaveApplication.findAll({
      where: {
        managerRefId,
        leaveStatus,
      },
    });

    console.log('Leave Data:', leaveData);

    res.status(200).json({ success: true, leaveData });
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateLeaveStatusById = async (req, res) => {
  const { id, leaveStatus } = req.body; 
  console.log("Received id:", id);
  try {
    const [updatedRowsCount, updatedDocuments] = await LeaveApplication.update(
      { leaveStatus },
      { where: {id }, returning: true }
    );

    if (updatedRowsCount > 0) {
      console.log('Updated Document:', updatedDocuments[0]);
      res.status(200).json({ success: true, message: "Leave Status Updated successfully" });
    } else {
      console.log('No matching document found for the given id.');
      res.status(404).json({ success: false, message: 'No matching document found' });
    }
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getLeaveData = async (req, res) => {
  const {refId} = req.query;

  try {
  
    const leaveData = await LeaveApplication.findAll({
      where: { refId }
    });

    res.status(200).json({ success: true, leaveData });
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const updateLeaveApplication = async (req, res) => {
  try {
    const { refId, imageString } = req.body;
 
    const [updatedRowsCount, updatedRows] = await LeaveApplication.update(
      { image: imageString },
      { where: { refId } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ success: false, message: 'Leave application not found.' });
    }

    return res.status(200).json({ success: true, message: 'Leave application updated successfully.' });
  } catch (error) {
    console.error('Error updating leave application:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.findAll();
    res.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const deleteEmployee = async (req, res) => {
  const employeeRefId = req.params.employeeRefId;
  try {
      const deletedEmployee = await User.destroy({
          where: {
              refId: employeeRefId
          }
      });
      if (deletedEmployee) {
          res.json({ success: true, message: 'Employee deleted successfully' });
      } else {
          res.status(404).json({ success: false, message: 'Employee not found' });
      }
  } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};





module.exports = {register,getAllEmployees,getAllEmployeesDepartment,getLeaveData,getTeamMembers,updateLeaveApplication, saveTeamMembers, deleteTeamMembers ,updateManagerProfile,updateEmployeeProfile, getUserProfile,applyLeave ,getLeaveDataCount,getLeaveDataByDateRange,updateLeaveAvailable, getLeaveDataPending, getLeaveDataApproved, getLeaveDataRejected,updateLeaveStatusById,deleteEmployee  };
