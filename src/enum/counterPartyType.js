export const counterPartyTypeEnum = Object.freeze({
    Partner: { id: 1, name: 'partner' },
    BankAgent: { id: 2, name: 'bank_agent' },
  });
  
  export const getCounterPartyTypeNameById = (id) => {
    const item = Object.values(counterPartyTypeEnum).find((x) => x.id == id);
    return item ? item.name : 'unknown';
  };
  
  export const getCounterPartyTypeById = (id) => {
    const item = Object.values(counterPartyTypeEnum).find((x) => x.id == id);
    return item ? item.name : 'unknown';
  };
  
  export const getCounterPartyTypeTagTypeById = (id) => {
    const item = Object.values(counterPartyTypeEnum).find((x) => x.id == id);
    return item ? item.tagType : 'default';
  };
  
  