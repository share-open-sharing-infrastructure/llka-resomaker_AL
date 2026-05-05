"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  categories: string[];
  value: string | null;
  onChange: (category: string | null) => void;
  isLoading?: boolean;
}

export function CategoryFilter({
  categories,
  value,
  onChange,
  isLoading = false,
}: CategoryFilterProps) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={(val) => onChange(val === "all" ? null : val)}
      disabled={isLoading || categories.length === 0}
    >
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Kategorie wählen" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Alle Kategorien</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
