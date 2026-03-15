import { PaginatedResponse } from "@/types";
import { CategorySearchParams, CategoryListItem } from "@/types/category";

let mockCategories: CategoryListItem[] = [
  {
    id: "cat-1",
    name: "Gold Jewellery",
    slug: "gold-jewellery",
    description: "Gold rings, chains, necklaces, and related items.",
    productCount: 42,
    isActive: true,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "Silver Jewellery",
    slug: "silver-jewellery",
    description: "Silver ornaments and daily wear products.",
    productCount: 18,
    isActive: true,
    createdAt: "2026-03-02T12:00:00.000Z",
  },
  {
    id: "cat-3",
    name: "Diamond Collection",
    slug: "diamond-collection",
    description: "Premium diamond category for high-value items.",
    productCount: 9,
    isActive: false,
    createdAt: "2026-03-03T09:30:00.000Z",
  },
  {
    id: "cat-4",
    name: "Temple Design",
    slug: "temple-design",
    description: "Traditional temple-inspired jewellery designs.",
    productCount: 14,
    isActive: true,
    createdAt: "2026-03-05T15:20:00.000Z",
  },
  {
    id: "cat-5",
    name: "Kids Collection",
    slug: "kids-collection",
    description: "Lightweight products curated for kids.",
    productCount: 7,
    isActive: true,
    createdAt: "2026-03-06T08:10:00.000Z",
  },
  {
    id: "cat-6",
    name: "Wedding Specials",
    slug: "wedding-specials",
    description: "Bridal and wedding-focused jewellery selection.",
    productCount: 21,
    isActive: false,
    createdAt: "2026-03-08T11:45:00.000Z",
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

const normalizeActive = (item: CategoryListItem) => {
  if (typeof item.isActive === "boolean") return item.isActive;
  if (typeof item.active === "boolean") return item.active;
  if (typeof item.status === "string") return item.status.toUpperCase() === "ACTIVE";
  return true;
};

const sortCategories = (
  categories: CategoryListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...categories].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...categories].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) * multiplier;
    }

    if (sortBy === "productCount") {
      return (a.productCount - b.productCount) * multiplier;
    }

    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "") * -1;
  });
};

const buildPaginatedResponse = (
  rows: CategoryListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<CategoryListItem> => {
  const total = rows.length;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const startIndex = (safePage - 1) * safeLimit;
  const data = rows.slice(startIndex, startIndex + safeLimit);

  return {
    success: true,
    data,
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const filterCategories = (params?: CategorySearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = mockCategories.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.name.toLowerCase().includes(search) ||
        item.slug.toLowerCase().includes(search);

    const matchesStatus =
      typeof params?.isActive === "boolean"
        ? normalizeActive(item) === params.isActive
        : true;

    return matchesSearch && matchesStatus;
  });

  return sortCategories(filtered, params?.sortBy, params?.sortOrder);
};

export const categoryService = {
  // Replace these mock implementations with real API calls when category endpoints are ready.
  getAll: async (params?: CategorySearchParams) => {
    await delay();
    const rows = filterCategories(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: CategorySearchParams) => {
    await delay();
    const rows = filterCategories(params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },

  create: async (data: { name: string; slug: string; description?: string }) => {
    await delay();
    const nextCategory: CategoryListItem = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      productCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockCategories = [nextCategory, ...mockCategories];

    return {
      success: true,
      data: nextCategory,
      message: "Category created.",
    };
  },

  update: async (
    id: string,
    data: { name: string; slug: string; description?: string },
  ) => {
    await delay();
    let updatedCategory: CategoryListItem | null = null;

    mockCategories = mockCategories.map((item) => {
      if (item.id !== id) return item;

      updatedCategory = {
        ...item,
        name: data.name,
        slug: data.slug,
        description: data.description,
      };

      return updatedCategory;
    });

    return {
      success: true,
      data: updatedCategory,
      message: "Category updated.",
    };
  },

  delete: async (id: string) => {
    await delay();
    mockCategories = mockCategories.map((item) =>
      item.id === id ? { ...item, isActive: false } : item,
    );

    return {
      success: true,
      data: true,
      message: "Category deactivated.",
    };
  },

  activate: async (id: string) => {
    await delay();
    mockCategories = mockCategories.map((item) =>
      item.id === id ? { ...item, isActive: true } : item,
    );

    return {
      success: true,
      data: true,
      message: "Category activated.",
    };
  },
};
