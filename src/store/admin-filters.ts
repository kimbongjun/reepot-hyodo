"use client";

import { create } from "zustand";

type AdminFilterState = {
  query: string;
  dateFrom: string;
  dateTo: string;
  region: string;
  timezone: string;
  onlyDuplicates: boolean;
  setQuery: (query: string) => void;
  setDateFrom: (dateFrom: string) => void;
  setDateTo: (dateTo: string) => void;
  setRegion: (region: string) => void;
  setTimezone: (timezone: string) => void;
  setOnlyDuplicates: (onlyDuplicates: boolean) => void;
  resetFilters: () => void;
};

export const useAdminFiltersStore = create<AdminFilterState>((set) => ({
  query: "",
  dateFrom: "",
  dateTo: "",
  region: "",
  timezone: "",
  onlyDuplicates: false,
  setQuery: (query) => set({ query }),
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
  setRegion: (region) => set({ region }),
  setTimezone: (timezone) => set({ timezone }),
  setOnlyDuplicates: (onlyDuplicates) => set({ onlyDuplicates }),
  resetFilters: () =>
    set({
      query: "",
      dateFrom: "",
      dateTo: "",
      region: "",
      timezone: "",
      onlyDuplicates: false
    })
}));
