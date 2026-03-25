export type PartnerCatalogItem = {
  id: number;
  partnerCode: string;
  partnerName: string;
  partnerType: string;
};

const BASE_FILE_URL = '/mock/partner-catalog.json';
const CUSTOM_STORAGE_KEY = 'finance_report_app_partner_catalog_custom';

type NewPartnerInput = {
  partnerCode: string;
  partnerName: string;
  partnerType: string;
};

function readCustomPartners(): PartnerCatalogItem[] {
  const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PartnerCatalogItem[]) : [];
  } catch {
    return [];
  }
}

function writeCustomPartners(partners: PartnerCatalogItem[]) {
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(partners));
}

async function readBasePartners(): Promise<PartnerCatalogItem[]> {
  const response = await fetch(BASE_FILE_URL);
  if (!response.ok) {
    throw new Error('Cannot load partner catalog data');
  }

  const data = (await response.json()) as PartnerCatalogItem[];
  return Array.isArray(data) ? data : [];
}

export const mockPartnerCatalogApi = {
  async getPartnerCatalog(): Promise<PartnerCatalogItem[]> {
    const [basePartners, customPartners] = await Promise.all([readBasePartners(), Promise.resolve(readCustomPartners())]);
    return [...basePartners, ...customPartners];
  },

  async createPartner(input: NewPartnerInput): Promise<PartnerCatalogItem> {
    const existingPartners = await this.getPartnerCatalog();

    const hasDuplicateCode = existingPartners.some(
      (item) => item.partnerCode.toLowerCase() === input.partnerCode.toLowerCase(),
    );
    if (hasDuplicateCode) {
      throw new Error('Partner code already exists.');
    }

    const nextId = existingPartners.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;

    const newPartner: PartnerCatalogItem = {
      id: nextId,
      partnerCode: input.partnerCode,
      partnerName: input.partnerName,
      partnerType: input.partnerType,
    };

    const customPartners = readCustomPartners();
    writeCustomPartners([...customPartners, newPartner]);

    return newPartner;
  },
};
