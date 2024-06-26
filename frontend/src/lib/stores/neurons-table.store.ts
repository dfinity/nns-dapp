import type { ResponsiveTableOrder } from "$lib/types/responsive-table";
import { writable } from "svelte/store";

const initialNeuronsTableOrder: ResponsiveTableOrder = [
  {
    columnId: "stake",
  },
  {
    columnId: "dissolveDelay",
  },
  {
    columnId: "id",
  },
];

const initNeuronsTableOrderStore = () => {
  const { subscribe, set } = writable<ResponsiveTableOrder>(
    initialNeuronsTableOrder
  );

  return {
    subscribe,
    set,
    reset() {
      set(initialNeuronsTableOrder);
    },
  };
};

export const neuronsTableOrderStore = initNeuronsTableOrderStore();
