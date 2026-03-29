import { transactionTypeEnum as TRANSACTION_TYPES } from "@/enum/transactionType";

export const ACCESS_PAGES = Object.freeze({
  role: 1,
  user: 2,
  brand: 3,
  bankProvider: 4,
  member: 6,
  bank: 7,
  transaction: 8,
  winlose: 9,
  changePassword: 10,
});

export const ACCESS_ACTIONS = Object.freeze({
  // Role
  listRole: 1,
  addRole: 2,
  updateRole: 3,

  // User
  listUser: 4,
  addUser: 5,
  updateUser: 6,
  updateUserPassword: 27,

  // Brand
  listBrand: 7,
  addBrand: 8,
  updateBrand: 9,

  // Bank Provider
  listBankProvider: 10,
  addBankProvider: 11,
  updateBankProvider: 12,

  // Member
  listMember: 16,
  addMember: 17,
  updateMember: 18,
  deleteMember: 28,

  // Bank
  listBank: 19,
  addBank: 20,
  updateBank: 21,
  deleteBank: 25,

  // Transaction
  listTransaction: 22,
  addTransaction: 23,
  deleteTransaction: 26,

  // Winlose report
  listWinlose: 24,
});

export const ACCESS_ACTION_ID_SET = new Set(Object.values(ACCESS_ACTIONS));

export const ACCESS_FEATURES = Object.freeze({
  deposit: TRANSACTION_TYPES.deposit.id,
  withdrawal: TRANSACTION_TYPES.withdrawal.id,
  borrow: TRANSACTION_TYPES.borrow.id,
  repay: TRANSACTION_TYPES.repay.id,
  transfer: TRANSACTION_TYPES.transfer.id,
  paymentGatewayCharge: TRANSACTION_TYPES.paymentGatewayCharge.id,
  adjustmentIn: TRANSACTION_TYPES.adjustmentIn.id,
  adjustmentOut: TRANSACTION_TYPES.adjustmentOut.id,
  // openingBalance is intentionally excluded
  wrongTransfer: TRANSACTION_TYPES.wrongTransfer.id,
  unclaim: TRANSACTION_TYPES.unclaim.id,
  other: TRANSACTION_TYPES.other.id,
  claim: TRANSACTION_TYPES.claim.id,
  balanceWithdraw: TRANSACTION_TYPES.balanceWithdraw.id,
});

export const ACCESS_FEATURE_ID_SET = new Set(Object.values(ACCESS_FEATURES));

