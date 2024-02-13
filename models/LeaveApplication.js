const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');
const moment = require('moment');

const LeaveApplication = sequelize.define('leave_application', {
  refId: { type: DataTypes.STRING, allowNull: false },
  managerRefId: { type: DataTypes.STRING,  allowNull: false},
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false },
  leaveAvailable: { type: DataTypes.INTEGER },
  teamLeadEmail: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.STRING, allowNull: false, defaultValue: () => moment().format('DD MMM YYYY') },
  endDate: { type: DataTypes.STRING, allowNull: false, defaultValue: () => moment().format('DD MMM YYYY') },
  noOfDays: { type: DataTypes.INTEGER, allowNull: false },
  leaveType: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  appliedDate: { type: DataTypes.STRING, defaultValue: () => moment().format('DD MMM YYYY') },
  leaveStatus: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: false, 
  
});

module.exports = LeaveApplication;
