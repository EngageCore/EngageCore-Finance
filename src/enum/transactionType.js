export const transactionTypeEnum = Object.freeze({
    deposit: { id: 1, name: 'deposit' },
    withdrawal: { id: 2, name: 'withdrawal' },
    borrow: { id: 3, name: 'borrow' },
    repay: { id: 4, name: 'repay' },
    transfer: { id: 5, name: 'transfer' },
    paymentGatewayCharge: { id: 6, name: 'paymentGatewayCharge' },
    adjustmentIn: { id: 7, name: 'adjustmentIn' },
    adjustmentOut: { id: 8, name: 'adjustmentOut' },
    openingBalance: { id: 9, name: 'openingBalance' },
    wrongTransfer: { id: 10, name: 'wrongTransfer' },
    unclaim: { id: 11, name: 'unclaim' },
    other: { id: 12, name: 'other' },
});
  
export const getTransactionTypeNameById = (id) => {
  const item = Object.values(transactionTypeEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};
  
export const getTransactionTypeIdById = (id) => {
  const item = Object.values(transactionTypeEnum).find(x => x.id == id);
  return item ? item.id : 0;
};