/* eslint-disable */
/* prettier-ignore */

// =====================
// Custom Module Routes (grouped by type for sidebar)
//
// - system: 系统设置 (role, user)
// - master: 主数据 (brand, bankProvider, counterParty, member, bank)
// - transaction: 交易 (transaction)
// - report: 报表 (winlose)
// =====================

import { ACCESS_PAGES } from '@/enum/accessPermission';

export const customModuleRoutes = [
  // 系统设置 - Role, User
  {
    name: 'system',
    path: '/system',
    layout: 'base',
    meta: {
      title: 'system_settings',
      i18nKey: 'system_settings',
      icon: 'fa6-solid:users-gear',
      order: 2
    },
    children: [
      {
        name: 'system_role',
        path: 'role',
        view: () => import("@/views/management/role.vue"),
        meta: {
          title: 'role',
          i18nKey: 'role',
          icon: 'fa6-solid:user-shield',
          order: 1,
          keepAlive: true,
          pageId: ACCESS_PAGES.role
        }
      },
      {
        name: 'system_user',
        path: 'user',
        view: () => import("@/views/management/user.vue"),
        meta: {
          title: 'user',
          i18nKey: 'user',
          icon: 'fa6-solid:user',
          order: 2,
          keepAlive: true,
          pageId: ACCESS_PAGES.user
        }
      }
    ]
  },
  // 主数据 - Brand, BankProvider, CounterParty, Member, Bank
  {
    name: 'master',
    path: '/master',
    layout: 'base',
    meta: {
      title: 'master_data',
      i18nKey: 'master_data',
      icon: 'fa6-solid:database',
      order: 3
    },
    children: [
      {
        name: 'master_brand',
        path: 'brand',
        view: () => import("@/views/management/brand.vue"),
        meta: {
          title: 'brand',
          i18nKey: 'brand',
          icon: 'fa6-solid:tags',
          order: 1,
          keepAlive: true,
          pageId: ACCESS_PAGES.brand
        }
      },
      {
        name: 'master_bankProvider',
        path: 'bank-provider',
        view: () => import("@/views/management/bankProvider.vue"),
        meta: {
          title: 'bankProvider',
          i18nKey: 'bankProvider',
          icon: 'fa6-solid:building-columns',
          order: 2,
          keepAlive: true,
          pageId: ACCESS_PAGES.bankProvider
        }
      },
      {
        name: 'master_counterParty',
        path: 'counter-party',
        view: () => import("@/views/management/counterParty.vue"),
        meta: {
          title: 'counterParty',
          i18nKey: 'counterParty',
          icon: 'fa6-solid:handshake',
          order: 3,
          keepAlive: true,
          pageId: ACCESS_PAGES.counterParty
        }
      },
      {
        name: 'master_member',
        path: 'member',
        view: () => import("@/views/management/member.vue"),
        meta: {
          title: 'member',
          i18nKey: 'member',
          icon: 'fa6-solid:users',
          order: 4,
          keepAlive: true,
          pageId: ACCESS_PAGES.member
        }
      },
      {
        name: 'master_bank',
        path: 'bank',
        view: () => import("@/views/management/bank.vue"),
        meta: {
          title: 'bank',
          i18nKey: 'bank',
          icon: 'fa6-solid:wallet',
          order: 5,
          keepAlive: true,
          pageId: ACCESS_PAGES.bank
        }
      }
    ]
  },
  // 交易 - Transaction
  {
    name: 'transaction',
    path: '/transaction',
    layout: 'base',
    meta: {
      title: 'transaction',
      i18nKey: 'transaction',
      icon: 'fa6-solid:money-bill-transfer',
      order: 4
    },
    children: [
      {
        name: 'transaction_list',
        path: 'list',
        view: () => import("@/views/management/transaction.vue"),
        meta: {
          title: 'transaction_list',
          i18nKey: 'transaction_list',
          icon: 'fa6-solid:list',
          order: 1,
          keepAlive: true,
          pageId: ACCESS_PAGES.transaction
        }
      }
    ]
  },
  // 报表 - Report
  {
    name: 'report',
    path: '/report',
    layout: 'base',
    meta: {
      title: 'report',
      i18nKey: 'report',
      icon: 'fa6-solid:chart-pie',
      order: 5
    },
    children: [
      {
        name: 'report_winlose',
        path: 'winlose',
        view: () => import("@/views/management/winlose.vue"),
        meta: {
          title: 'winlose',
          i18nKey: 'winlose',
          icon: 'fa6-solid:chart-line',
          order: 1,
          keepAlive: true,
          pageId: ACCESS_PAGES.winlose
        }
      },
      {
        name: 'report_winlose_bank',
        path: 'winlose-bank',
        view: () => import("@/views/management/winloseBank.vue"),
        meta: {
          title: 'winlose_by_bank',
          i18nKey: 'winlose_by_bank',
          icon: 'fa6-solid:chart-line',
          order: 2,
          keepAlive: true,
          pageId: ACCESS_PAGES.winlose
        }
      },
      {
        name: 'report_winlose_month',
        path: 'winlose-month',
        view: () => import("@/views/management/winloseMonth.vue"),
        meta: {
          title: 'winlose_by_month',
          i18nKey: 'winlose_by_month',
          icon: 'fa6-solid:chart-line',
          order: 3,
          keepAlive: true,
          pageId: ACCESS_PAGES.winlose
        }
      }
    ]
  }
];
