
import { create } from "zustand";
import type { Room, RoomDetail } from "../types/room";

interface RoomStore {
  currentRoom: Room | RoomDetail | null;
  setCurrentRoom: (room: Room | RoomDetail| null) => void;
  clearCurrentRoom: () => void;
}

export const useRoomStore = create<RoomStore>()((set) => ({
  currentRoom: null,

  setCurrentRoom: (room) => set({ currentRoom: room }),

  clearCurrentRoom: () => set({ currentRoom: null }),
}));
