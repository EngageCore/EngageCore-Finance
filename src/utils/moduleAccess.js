import { ModuleStructure, AccessPages, AccessActions, AccessFeatures, AccessNotification } from "@/enum/moduleAccess";

let idCounter = 0;
const generateUniqueId = () => {
  return ++idCounter;
};

const buildModuleTree = () => {
  const modules = [];
  
  // 遍历每个 Category
  Object.entries(ModuleStructure).forEach(([categoryName, categoryContent]) => {
    
    const categoryNode = {
      id: generateUniqueId(),
      name: categoryName.toLowerCase(),
      itemType: null,
      itemId: null,
      parentId: null,
      isChecked: false,
      childs: []
    };
    
    // 遍历该 Category 下的每个 Page
    Object.entries(categoryContent).forEach(([pageName, pageContent]) => {
      // 检查是否是 NOTIFICATIONS 类别下的页面
      const isNotificationPage = categoryName === 'NOTIFICATIONS';
      
      // 根据类别选择对应的enum
      const pageInfo = isNotificationPage ? AccessNotification[pageName] : AccessPages[pageName];
      
      if (!pageInfo) return;
      
      const pageNode = {
        id: generateUniqueId(),
        name: pageInfo.name,
        itemType: isNotificationPage ? 'notificationIds' : 'accessPageIds',
        itemId: pageInfo.id,
        parentId: categoryNode.id,
        isChecked: false,
        isExpanded: false,
        childs: []
      };
      
      // 处理该页面下的所有 Actions
      Object.entries(pageContent).forEach(([actionName, actionContent]) => {
        const actionInfo = AccessActions[actionName];
        
        // 跳过没有在 AccessActions 中定义的操作
        if (!actionInfo) return;
        
        // 创建 Action 节点
        const actionNode = {
          id: generateUniqueId(),
          name: actionInfo.name,
          itemId: actionInfo.id,
          itemType: 'accessPageActionIds',
          parentId: pageNode.id,
          isChecked: false,
          isExpanded: false,
          childs: []
        };
        
        // 处理该 Action 下的所有 Features
        if (typeof actionContent === 'object' && actionContent !== null) {
          Object.entries(actionContent).forEach(([featureName]) => {
            const featureInfo = AccessFeatures[featureName];
            
            // 只处理在 AccessFeatures 中定义的功能
            if (featureInfo) {
              const featureNode = {
                id: generateUniqueId(),
                name: featureInfo.name,
                itemType: 'accessPageFeatureIds',
                itemId: featureInfo.id,
                parentId: actionNode.id,
                isChecked: false,
                isExpanded: false,
              };
              
              actionNode.childs.push(featureNode);
            }
          });
        }
        
        // 只要 Action 存在就添加到 Page（无论是否有子节点）
        pageNode.childs.push(actionNode);
      });
      
      // 只有当 Page 有子节点时才添加到 Category
      // if (pageNode.childs.length > 0) {
        categoryNode.childs.push(pageNode);
      // }
    });
    
    // 只有当 Category 有子节点时才添加到 modules
    if (categoryNode.childs.length > 0) {
      modules.push(categoryNode);
    }
  });
  
  return modules;
};

export const modules = buildModuleTree();