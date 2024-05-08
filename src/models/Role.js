const mongoose = require('mongoose');

const PermissionsEnum = {
  MANAGE_USERS: 'manage_users',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_PERMISSIONS: 'manage_permissions'
};

const rolePermissions = {
  superadmin: Object.values(PermissionsEnum),
  admin: [PermissionsEnum.MANAGE_USERS, PermissionsEnum.MANAGE_EVENTS, PermissionsEnum.MANAGE_CONTENT],
  contentManager: [PermissionsEnum.MANAGE_CONTENT],
  userManager: [PermissionsEnum.MANAGE_USERS],
  eventManager: [PermissionsEnum.MANAGE_EVENTS],
};

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['superadmin', 'admin', 'contentManager', 'userManager', 'eventManager']
  },
  profilePic: String,
  description: String,
  permissions: [{ type: String, enum: Object.values(PermissionsEnum) }]
});

roleSchema.pre('save', function(next) {
  if (rolePermissions[this.name]) {
    this.permissions = rolePermissions[this.name];
  }
  next();
});

const Role = mongoose.model('Role', roleSchema);
exports.Role = Role;
