export const documentFlows = {
  1: {items:'Requested items',description:'Approval authorises this request. Fulfilment through procurement or issue from stock is recorded separately.'},
  2: {items:'Procurement items',description:'Procurement can fulfil approved requisition items or replenish stock. The shared item retains its original request, account and stock links.'},
  3: {items:'Cash advance items',description:'A cash advance requests cash to pay directly for these items. It follows its own approval workflow and bypasses the requisition-to-procurement process. Keep the supporting receipts with the item records.'},
  4: {items:'Budget allocations',description:'Budget approval authorises the spending plan. Individual allocation approval and closing the budget period remain separate operations.'},
  6: {items:'Transfer entries',description:'Cash transfers record movements between accounts. Review the debit and credit entries and their selected accounts.'},
  7: {items:'Income entries',description:'Income records money received against the selected accounts. Review credit amounts and the supporting documents.'},
  8: {items:'Stock items',description:'Stock records the items held in store. Retain the source procurement and account links; issue against a requisition through the separate fulfilment process.'},
};
export const documentFlow = type => documentFlows[Number(type)] || {items:'Line items',description:'Review the document, its account classifications and its configured approval workflow.'};
