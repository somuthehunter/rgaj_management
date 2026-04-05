const endpoints = {
  auth: {
    login: `/auth/login`,
    refresh: `/auth/refresh`,
    logout: `/auth/logout`,
    profile: `/auth/profile`,
  },

  products: {
    create: `/products`,
    getAll: `/products`,
    getById: (id: string) => `/products/${id}`,
    search: `/products/search`,
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    activate: (id: string) => `/products/${id}/activate`,
    returnToAdmin: (id: string) => `/products/${id}/return`,
  },

  stores: {
    create: `/stores`,
    getAll: `/stores`,
    getById: (id: string) => `/stores/${id}`,
    update: (id: string) => `/stores/${id}`,
    delete: (id: string) => `/stores/${id}`,
    activate: (id: string) => `/stores/${id}/activate`,
    stats: (id: string) => `/stores/${id}/stats`,
  },

  users: {
    create: `/users`,
    getAll: `/users`,
    getById: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    activate: (id: string) => `/users/${id}/activate`,
    byStore: (storeId: string) => `/users/store/${storeId}`,
  },

  inventory: {
    central: `/inventory/central`,
    centralByProduct: (productId: string) => `/inventory/central/${productId}`,
    adjust: (productId: string) => `/inventory/central/${productId}/adjust`,
    allocate: `/inventory/allocate`,
    transfer: `/inventory/transfer`,
    summary: `/inventory/summary`,
    byStore: (storeId: string) => `/inventory/store/${storeId}`,
    ledger: `/inventory/ledger`,
    ledgerSummary: `/inventory/ledger/summary`,
  },

  billing: {
    invoices: `/billing/invoices`,
    invoiceById: (id: string) => `/billing/invoices/${id}`,
    cancelInvoice: (id: string) => `/billing/invoices/${id}/cancel`,
    customers: `/billing/customers`,
    customerById: (id: string) => `/billing/customers/${id}`,
  },

  audit: {
    logs: `/audit/logs`,
    salesReport: `/audit/reports/sales`,
    inventoryReport: `/audit/reports/inventory`,
    storeReport: (storeId: string) => `/audit/reports/store/${storeId}`,
  },

  refunds: {
    create: `/refunds`,
    getAll: `/refunds`,
    getById: (id: string) => `/refunds/${id}`,
    approve: (id: string) => `/refunds/${id}/approve`,
    reject: (id: string) => `/refunds/${id}/reject`,
  },
};

export default endpoints;
