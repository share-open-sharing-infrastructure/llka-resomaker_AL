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
  availableOnly: boolean = true
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
