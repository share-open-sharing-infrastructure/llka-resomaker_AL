"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { ItemGrid, ItemGridSkeleton } from "./item-grid";
import { Pagination } from "./pagination";
import { getItems, getCategories } from "@/lib/api/items";
import { Item } from "@/lib/types/item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/config-context";

interface CatalogProps {
  initialItems?: Item[];
}

export function Catalog({ initialItems }: CatalogProps) {
  const config = useConfig();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params (if URL params feature is enabled)
  const initialSearch = config.features.urlParams
    ? searchParams.get("q") || ""
    : "";
  const initialPage = config.features.urlParams
    ? parseInt(searchParams.get("page") || "1", 10)
    : 1;
  const initialAvailable = config.features.urlParams
    ? searchParams.get("all") !== "1"
    : config.defaults.availableOnly;
  const initialCategory = config.features.urlParams
    ? searchParams.get("cat") || null
    : null;

  const [items, setItems] = useState<Item[]>(initialItems || []);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(initialAvailable);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialItems);
  const [error, setError] = useState<string | null>(null);

  const categoriesFetched = useRef(false);

  // Fetch categories on mount (only once)
  useEffect(() => {
    if (!config.features.categoryFilter || categoriesFetched.current) return;
    categoriesFetched.current = true;

    setCategoriesLoading(true);
    getCategories()
      .then(setCategories)
      .catch(() => {
        // Silently fail — filter just won't show categories
      })
      .finally(() => setCategoriesLoading(false));
  }, [config.features.categoryFilter]);

  // Update URL params (only if feature is enabled)
  const updateUrl = useCallback(
    (newSearch: string, newPage: number, newAvailableOnly: boolean, newCategory: string | null) => {
      if (!config.features.urlParams) return;

      const params = new URLSearchParams();
      if (newSearch) params.set("q", newSearch);
      if (newPage > 1) params.set("page", newPage.toString());
      if (!newAvailableOnly) params.set("all", "1");
      if (newCategory) params.set("cat", newCategory);

      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "/", { scroll: false });
    },
    [router, config.features.urlParams]
  );

  const fetchItems = useCallback(
    async (searchTerm: string, showAvailableOnly: boolean, pageNum: number, selectedCategory: string | null) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getItems(
          pageNum,
          config.limits.itemsPerPage,
          searchTerm || undefined,
          showAvailableOnly,
          selectedCategory || undefined
        );
        setItems(response.items);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Fehler beim Laden der Gegenstände"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [config.limits.itemsPerPage]
  );

  // Debounced search - reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchItems(search, availableOnly, 1, category);
      updateUrl(search, 1, availableOnly, category);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, availableOnly, category, fetchItems, updateUrl]);

  // Page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchItems(search, availableOnly, newPage, category);
    updateUrl(search, newPage, availableOnly, category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial load from URL params
  useEffect(() => {
    if (!initialItems) {
      fetchItems(initialSearch, initialAvailable, initialPage, initialCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailableOnly = () => {
    setAvailableOnly((prev) => !prev);
  };

  const showControls = config.features.search || config.features.availabilityToggle || config.features.categoryFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {config.features.availabilityToggle
              ? (availableOnly ? "Verfügbare Gegenstände" : "Alle Gegenstände")
              : "Gegenstände"}
          </h1>
          <p className="text-muted-foreground">
            {totalItems > 0
              ? `${totalItems} Gegenstände gefunden`
              : "Wähle Gegenstände aus und reserviere sie zur Abholung."}
          </p>
        </div>
        {showControls && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {config.features.search && (
              <div className="flex-1 sm:w-72 min-w-0">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Gegenstand suchen..."
                />
              </div>
            )}
            {config.features.categoryFilter && (
              <CategoryFilter
                categories={categories}
                value={category}
                onChange={setCategory}
                isLoading={categoriesLoading}
              />
            )}
            {config.features.availabilityToggle && (
              <Button
                variant={availableOnly ? "outline" : "secondary"}
                size="icon"
                onClick={toggleAvailableOnly}
                title={availableOnly ? "Alle anzeigen" : "Nur verfügbare anzeigen"}
              >
                {availableOnly ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {config.features.availabilityToggle && !availableOnly && (
        <p className="text-sm text-muted-foreground">
          Es werden auch nicht verfügbare Gegenstände angezeigt.
        </p>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems(search, availableOnly, page, category)}
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? <ItemGridSkeleton count={config.limits.itemsPerPage} /> : <ItemGrid items={items} />}

      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
