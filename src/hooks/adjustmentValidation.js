import { handleMessage } from '@/utils/notification';

// Validation for Adjustment In
export const validateAdjustmentIn = (formData) => {
  if (!formData.paymentChannelAccountId) {
    handleMessage('Bank Account is required for Adjustment In type', 'error');
    return false;
  }
  if (!formData.amount) {
    handleMessage('Amount is required for Adjustment In type', 'error');
    return false;
  }
  return true;
};

// Validation for Adjustment Out
export const validateAdjustmentOut = (formData) => {
  if (!formData.paymentChannelAccountId) {
    handleMessage('Payment Channel Account is required for Adjustment Out type', 'error');
    return false;
  }
  if (!formData.amount || formData.amount > formData.currentBalanceAmount) {
    handleMessage('Amount must be less than or equal to the available balance', 'error');
    return false;
  }
  return true;
};

// Validation for Other Adjustment
export const validateOtherAdjustment = (formData) => {
  if (!formData.transactionTypeId) {
    handleMessage('Transaction Type is required for Other Adjustment type', 'error');
    return false;
  }

  if (formData.transactionTypeId == 2) {
    if (!formData.amount || formData.amount > formData.currentBalanceAmount) {
      handleMessage('Amount must be less than or equal to the available balance', 'error');
      return false;
    }
  }
  
  return true;
};

// Validation for Internal Transfer
export const validateInternalTransfer = (formData) => {
  if (!formData.fromBankAccountId || !formData.toBankAccountId) {
    handleMessage('Both "From Bank" and "To Bank" accounts are required for Internal Transfer type', 'error');
    return false;
  }
  if (formData.amount > formData.fromBankBalance) {
    handleMessage('Amount must be less than or equal to the from bank balance', 'error');
    return false;
  }
  return true;
};
