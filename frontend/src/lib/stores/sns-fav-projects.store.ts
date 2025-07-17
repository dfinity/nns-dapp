import { Principal } from "@dfinity/principal";
import { writable } from "svelte/store";

export interface SnsFavProjectsStoreData {
  rootCanisterIds: Principal[] | undefined;
  certified: boolean | undefined;
}

/**
 * A store that contains user favorite projects
 */
const initSnsFavProjectsStore = () => {
  const { update, subscribe, set } = writable<SnsFavProjectsStoreData>({
    rootCanisterIds: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    set({
      rootCanisterIds,
      certified,
    }: {
      rootCanisterIds: Principal[];
      certified: boolean;
    }) {
      set({
        rootCanisterIds,
        certified,
      });
    },

    remove(rootCanisterId: Principal) {
      update(({ rootCanisterIds, certified }) => ({
        rootCanisterIds: rootCanisterIds?.filter(
          (id) => id.toText() !== rootCanisterId.toText()
        ),
        certified,
      }));
    },

    reset() {
      set({
        rootCanisterIds: undefined,
        certified: undefined,
      });
    },
  };
};

export const snsFavProjectsStore = initSnsFavProjectsStore();
