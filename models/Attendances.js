const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Attendances = sequelize.define('attendances', {
    refId: { type: DataTypes.STRING, allowNull: false },
    userEmail: { type: DataTypes.STRING, allowNull: false },
    date :{type:DataTypes.STRING,allowNull:false},
    checkInTime: { type: DataTypes.STRING, allowNull: true },
    checkOutTime: { type: DataTypes.STRING, allowNull: true},
    hoursWorked:{ type: DataTypes.STRING, allowNull: true},
    extraHoursWorked:{type: DataTypes.STRING, allowNull: true}
}, {
    timestamps: false // This line excludes createdAt and updatedAt columns
})
module.exports = Attendances;