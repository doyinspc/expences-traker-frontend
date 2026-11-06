import { PROCUREMENT_DOCUMENT_LABEL } from './documentLabels.js';
export const documentFlows = {
  1: {items:'Requested items',description:'Approval authorises this request. Fulfilment through procurement or issue from stock is recorded separately.'},
  2: {items:`${PROCUREMENT_DOCUMENT_LABEL} items`,description:'A Purchase Order consolidates outstanding demand and sets agreed prices, including any extra quantity for store. Approved orders can be combined into Procurement; stock issues fulfil the original requests. Older combined purchasing records retain their existing treatment.'},
  9: {items:'Procurement items',description:'Procurement combines approved Purchase Orders at this location. Its workflow records payment; physical receipts add stock. Issue stock separately to fulfil requisitions, retaining any extra quantity in store.'},
  3: {items:'Cash advance items',description:'A cash advance requests cash to pay directly for these items. It follows its own approval workflow and bypasses the requisition-to-procurement process. Keep the supporting receipts with the item records.'},
  4: {items:'Budget allocations',description:'Budget approval authorises the spending plan. Individual allocation approval and closing the budget period remain separate operations.'},
  6: {items:'Transfer entries',description:'Cash transfers record movements between accounts. Review the debit and credit entries and their selected accounts.'},
  7: {items:'Income entries',description:'Income records money received against the selected accounts. Review credit amounts and the supporting documents.'},
  8: {items:'Stock items',description:'Stock records the items held in store. Retain the source procurement and account links; issue against a requisition through the separate fulfilment process.'},
};
export const documentFlow = type => documentFlows[Number(type)] || {items:'Line items',description:'Review the document, its account classifications and its configured approval workflow.'};
