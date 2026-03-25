export type ExpenseCatalogItem = {
  id: number;
  expenseCode: string;
  description: string;
  category: string;
};

export const mockExpenseCatalogApi = {
  async getExpenseCatalog(): Promise<ExpenseCatalogItem[]> {
    const response = await fetch('/mock/expense-catalog.json');
    if (!response.ok) {
      throw new Error('Cannot load expense catalog data');
    }

    const data = (await response.json()) as ExpenseCatalogItem[];
    return Array.isArray(data) ? data : [];
  },
};
