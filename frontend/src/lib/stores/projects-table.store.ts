import type { ProjectsTableOrder } from "$lib/types/staking";
import { writable } from "svelte/store";

const initialProjectsTableOrder: ProjectsTableOrder = [
  {
    columnId: "stake",
  },
  {
    columnId: "title",
  },
];

const initProjectsTableOrderStore = () => {
  const { subscribe, set } = writable<ProjectsTableOrder>(
    initialProjectsTableOrder
  );

  return {
    subscribe,
    set,
  };
};

export const projectsTableOrderStore = initProjectsTableOrderStore();
