// src/stores/permissionStore.js
import { defineStore } from 'pinia';
import { modules } from '@/utils/moduleAccess'; // Import the modules array

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    checkedIds: new Set(),
    groupedPermissions: {
      accessPageIds: [],
      accessPageActionIds: [],
      accessPageFeatureIds: [],
      notificationIds: [],
    },
  }),
  actions: {
    toggleCheck(id) {
      if (this.checkedIds.has(id)) {
        this.checkedIds.delete(id);
      } else {
        this.checkedIds.add(id);
      }
      this.updateGroupedPermissions();
    },
    isChecked(id) {
      return this.checkedIds.has(id);
    },
    toggleAllChilds(parentId, permissions, checked) {
      this.toggleCheck(parentId);
      this.toggleAllChildsRecursive(parentId, permissions, checked);
      this.updateGroupedPermissions();
    },
    toggleAllChildsRecursive(parentId, permissions, checked) {
      if (!permissions || !Array.isArray(permissions)) return; // Add this check

      permissions.forEach(permission => {
        if (permission.parentId === parentId) {
          if (checked) {
            this.checkedIds.add(permission.id);
          } else {
            this.checkedIds.delete(permission.id);
          }
          if (permission.childs) {
            this.toggleAllChildsRecursive(permission.id, permission.childs, checked);
          }
        }
      });
    },
    updateGroupedPermissions() {
      const groupedPermissions = {
        accessPageIds: [],
        accessPageActionIds: [],
        accessPageFeatureIds: [],
        notificationIds: [],
      };

      this.checkedIds.forEach(id => {
        const permission = this.findPermissionById(id);
        if (permission) {
          const itemType = permission.itemType;
          const itemId = permission.itemId;
          if (!groupedPermissions[itemType].includes(itemId)) {
            groupedPermissions[itemType].push(itemId);
          }
        }
      });

      this.groupedPermissions = groupedPermissions;
    },
    findPermissionById(id) {
      return this.findPermissionByIdRecursive(id, modules); // Pass the modules array here
    },
    findPermissionByIdRecursive(id, permissions) {
      if (!permissions || !Array.isArray(permissions)) return null; // Add this check

      for (const permission of permissions) {
        if (permission.id === id) {
          return permission;
        }
        if (permission.childs) {
          const found = this.findPermissionByIdRecursive(id, permission.childs);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },
    setCheckedPermissions(accessPageIds, accessPageActionIds, accessPageFeatureIds) {
      this.checkedIds.clear();
      this.setCheckedPermissionsRecursive(modules, accessPageIds, accessPageActionIds, accessPageFeatureIds);
      this.updateGroupedPermissions();
    },
    setCheckedPermissionsRecursive(permissions, accessPageIds, accessPageActionIds, accessPageFeatureIds) {
      if (!permissions || !Array.isArray(permissions)) return; // Add this check

      permissions.forEach(permission => {
        if (
          (permission.itemType === 'accessPageIds' && accessPageIds.includes(permission.itemId)) ||
          (permission.itemType === 'accessPageActionIds' && accessPageActionIds.includes(permission.itemId)) ||
          (permission.itemType === 'accessPageFeatureIds' && accessPageFeatureIds.includes(permission.itemId))
        ) {
          this.checkedIds.add(permission.id);
          permission.isChecked = true;
        }
        if (permission.childs) {
          this.setCheckedPermissionsRecursive(permission.childs, accessPageIds, accessPageActionIds, accessPageFeatureIds);
        }
      });
    },
    clearAllCheckedPermissions() {
      this.checkedIds.clear();
      this.clearAllCheckedPermissionsRecursive(modules);
      this.updateGroupedPermissions();
    },
    clearAllCheckedPermissionsRecursive(permissions) {
      if (!permissions || !Array.isArray(permissions)) return; // Add this check

      permissions.forEach(permission => {
        permission.isChecked = false;
        if (permission.childs) {
          this.clearAllCheckedPermissionsRecursive(permission.childs);
        }
      });
    },
  },
});
