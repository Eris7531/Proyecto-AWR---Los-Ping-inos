import { create } from "zustand";
import type { User } from "../types/user";

interface UserStore {
  user: User | null;
  loadingSession: boolean;
  setUser: (user: User | null) => void;
  setLoadingSession: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  loadingSession: true,
  setUser: (user) => set({ user }),
  setLoadingSession: (loadingSession) => set({ loadingSession }),
}));