const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../db.js');

const TeamMember = sequelize.define('team_members', {

  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: { type: DataTypes.STRING },

   refId: {
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
   
  }, 
   managerRefId: {
  type: DataTypes.STRING, 
  allowNull: false, 
 
}
}, {
  timestamps: false,
});

const User = sequelize.define('users', {
  refId:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  managerRefId: {
    type: DataTypes.STRING, 
    allowNull: true, 
    
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamLeadName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamLeadEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_data: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  image_contentType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  hooks: {
    beforeCreate: async (user) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedPassword;
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;
      }
    },
  },
  timestamps: false,
});

User.hasMany(TeamMember, { as: 'teamMembers', foreignKey: 'refId', sourceKey: 'refId' });
TeamMember.belongsTo(User, { foreignKey: 'managerRefId', targetKey: 'refId', as: 'manager' });


module.exports = { User, TeamMember };
