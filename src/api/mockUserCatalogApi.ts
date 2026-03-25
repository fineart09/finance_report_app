export type UserCatalogItem = {
  id: number;
  userId: string;
  fullName: string;
  role: string;
};

export const mockUserCatalogApi = {
  async getUserCatalog(): Promise<UserCatalogItem[]> {
    const response = await fetch('/mock/user-catalog.json');
    if (!response.ok) {
      throw new Error('Cannot load user catalog data');
    }

    const data = (await response.json()) as UserCatalogItem[];
    return Array.isArray(data) ? data : [];
  },
};
