import type { NeuronsTableOrder } from "$lib/types/neurons-table";
import { writable } from "svelte/store";

const initialNeuronsTableOrder: NeuronsTableOrder = [
  {
    columnId: "stake",
  },
  {
    columnId: "dissolveDelay",
  },
];

const initNeuronsTableOrderStore = () => {
  const { subscribe, set } = writable<NeuronsTableOrder>(
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
