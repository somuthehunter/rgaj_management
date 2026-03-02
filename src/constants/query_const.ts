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
};

export default endpoints;
