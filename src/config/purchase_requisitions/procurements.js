import purchaseOrders from './purchaseorders';

export default {
  ...purchaseOrders,
  frontendRoutes: ['/procurement/procurement'],
  displayName: 'Procurement',
  description:
    'Combine approved Purchase Orders at one location for purchasing, payment and receipt into stock.',
  fields: {
    ...purchaseOrders.fields,
    requisition_type: {
      ...purchaseOrders.fields.requisition_type,
      defaultValue: 9,
      hidden: true,
    },
  },
};
