import { fetchApi } from "./client";
import { Item, ItemsResponse } from "@/lib/types/item";
import { config } from "@/lib/config";

function normalizeItem(item: Item): Item {
  let category = (item as unknown as { category: unknown }).category;
  if (typeof category === 'string') {
    try {
      const parsed = JSON.parse(category);
      category = Array.isArray(parsed) ? parsed : [category];
    } catch {
      // Not JSON — treat as single category or empty if blank
      category = category ? [category] : [];
    }
  }
  if (!Array.isArray(category)) category = [];
  return { ...item, category: category as string[] };
}

export async function getItems(
  page: number = 1,
  perPage: number = 30,
  search?: string,
  availableOnly: boolean = true,
  category?: string
): Promise<ItemsResponse> {
  const filters: string[] = [];

  if (availableOnly) {
    filters.push('status="instock"');
  } else {
    // Exclude deleted items
    filters.push('status!="deleted"');
  }

  if (search) {
    const searchTerm = search.replace(/"/g, '\\"');
    filters.push(
      `(name~"${searchTerm}" || description~"${searchTerm}" || category~"${searchTerm}" || synonyms~"${searchTerm}")`
    );
  }

  if (category) {
    const categoryTerm = category.replace(/"/g, '\\"');
    filters.push(`category~"${categoryTerm}"`);
  }

  const params = new URLSearchParams({
    filter: filters.join(" && "),
    sort: config.defaults.sort,
    page: page.toString(),
    perPage: perPage.toString(),
  });

  const raw = await fetchApi<ItemsResponse>(
    `/api/collections/item_public/records?${params.toString()}`
  );
  return { ...raw, items: raw.items.map(normalizeItem) };
}

export async function getItem(id: string): Promise<Item> {
  const raw = await fetchApi<Item>(`/api/collections/item_public/records/${id}`);
  return normalizeItem(raw);
}

export async function getItemByIid(iid: number): Promise<Item | null> {
  const params = new URLSearchParams({
    filter: `iid=${iid}`,
    perPage: "1",
  });

  const response = await fetchApi<ItemsResponse>(
    `/api/collections/item_public/records?${params.toString()}`
  );

  return response.items.length > 0 ? normalizeItem(response.items[0]) : null;
}

export async function getCategories(): Promise<string[]> {
  const categories = new Set<string>();
  let page = 1;
  let totalPages = 1;

  // Fetch all items with only the category field to minimize payload
  while (page <= totalPages) {
    const params = new URLSearchParams({
      filter: 'status!="deleted"',
      fields: "category",
      perPage: "500",
      page: page.toString(),
    });

    const raw = await fetchApi<ItemsResponse>(
      `/api/collections/item_public/records?${params.toString()}`
    );

    for (const item of raw.items) {
      const normalized = normalizeItem(item as Item);
      for (const cat of normalized.category) {
        const trimmed = cat.trim();
        if (trimmed) categories.add(trimmed);
      }
    }

    totalPages = raw.totalPages;
    page++;
  }

  return Array.from(categories).sort();
}
