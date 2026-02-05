export const AccessPages = {
  DASHBOARD: { id: 1, name: 'dashboard' },
  BRAND: { id: 2, name: 'brand_management' },
  MEMBER: { id: 3, name: 'member_management' },
  MISSION: { id: 4, name: 'mission_management' },
  USER: { id: 5, name: 'user_management' },
  ROLE: { id: 6, name: 'role_management' },
}

export const AccessActions = {
  ADD_BRAND: { id: 1, name: 'add_brand' },
  EDIT_BRAND: { id: 2, name: 'edit_brand' },
  ADD_MISSION: { id: 3, name: 'add_mission' },
  EDIT_MISSION: { id: 4, name: 'edit_mission' },
  ADD_USER: { id: 5, name: 'add_user' },
  EDIT_USER: { id: 6, name: 'edit_user' },
  ADD_ROLE: { id: 7, name: 'add_role' },
  EDIT_ROLE: { id: 8, name: 'edit_role' },
}

export const AccessFeatures = {}

export const AccessNotification = {}

export const ModuleStructure = {
  DASHBOARD: {
    DASHBOARD: {},
  },
  BRAND: {
    BRAND: {  
      ADD_BRAND: {},
      EDIT_BRAND: {},
    },
  },
  MEMBER: {
    MEMBER: {},
  },
  MISSION: {
    MISSION: {
      ADD_MISSION: {},
      EDIT_MISSION: {},
    },
  },
  USER: {
    User: {
      ADD_USER: {},
      EDIT_USER: {},
    },
  },
  ROLE: {
    ROLE: {
      ADD_ROLE: {},
      EDIT_ROLE: {},
    },
  },
}