import { getFavProjects, setFavProjects } from "$lib/api/fav-projects.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { FavProjects } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
import { toastsError } from "$lib/stores/toasts.store";
import { isLastCall } from "$lib/utils/env.utils";
import {
  fromSnsFavProject,
  toSnsFavProject,
} from "$lib/utils/sns-fav-projects.utils";
import type { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadSnsFavProjects = async () => {
  return queryAndUpdate<FavProjects, unknown>({
    request: (options) => getFavProjects(options),
    strategy: FORCE_CALL_STRATEGY,
    onLoad: ({ response: { fav_projects: favProjects }, certified }) => {
      snsFavProjectsStore.set({
        rootCanisterIds: favProjects.map(fromSnsFavProject),
        certified,
      });
    },
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (err instanceof AccountNotFoundError) {
        // When you log in with a new account for the first time, the account is created in the NNS dapp.
        // If you request favorite projects before the account is created, an `AccountNotFound` error will be thrown.
        // In this case, we can be sure that the user has no favorite projects.
        snsFavProjectsStore.set({
          rootCanisterIds: [],
          certified,
        });
        return;
      }

      if (!isLastCall({ strategy, certified })) {
        return;
      }

      // Explicitly handle only UPDATE errors
      // Reset the store to avoid showing stale data.
      snsFavProjectsStore.reset();

      // Failing to load favorite projects is not a critical error,
      // so we just log in console.
    },
    logMessage: "Get Favorite Projects",
  });
};

// Save favorite projects to the nns-dapp backend.
// Returns an error if the operation fails.
const saveSnsFavProject = async ({
  projects,
}: {
  projects: Principal[];
}): Promise<{ err: Error | undefined }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await setFavProjects({
      identity,
      favProjects: projects.map(toSnsFavProject),
    });
  } catch (err) {
    return { err: err as Error };
  }

  return { err: undefined };
};

/**
 * Add new favorite project and reload favorite projects from the `nns-dapp` backend to update the `snsFavProjectsStore`.
 * No success toast is shown, as the state will be reflected on the UI immediately.
 */
export const addSnsFavProject = async (
  projectToAdd: Principal
): Promise<{ success: boolean }> => {
  try {
    startBusy({
      initiator: "fav-project-adding",
      labelKey: "fav_projects.adding",
    });

    const projects = [
      ...(get(snsFavProjectsStore).rootCanisterIds ?? []),
      projectToAdd,
    ];
    const { err } = await saveSnsFavProject({ projects });

    if (isNullish(err)) {
      // Update the store.
      await loadSnsFavProjects();
      return { success: true };
    }

    toastsError({
      labelKey: "error__fav_projects.adding_error",
    });

    return { success: false };
  } finally {
    stopBusy("fav-project-adding");
  }
};

/**
 * Remove favorite project and reload favorite projects from the `nns-dapp` backend to update the `snsFavProjectsStore`.
 * No success toast is shown, as the state will be reflected on the UI immediately.
 */
export const removeSnsFavProject = async (
  rootCanisterId: Principal
): Promise<{ success: boolean }> => {
  try {
    startBusy({
      initiator: "fav-project-removing",
      labelKey: "fav_projects.removing",
    });

    const remainingProjects = (
      get(snsFavProjectsStore).rootCanisterIds ?? []
    ).filter((id) => id.toText() !== rootCanisterId.toText());
    const { err } = await saveSnsFavProject({ projects: remainingProjects });

    if (isNullish(err)) {
      snsFavProjectsStore.remove(rootCanisterId);

      return { success: true };
    }

    toastsError({
      labelKey: "error__fav_projects.removing_error",
    });

    return { success: false };
  } finally {
    stopBusy("fav-project-removing");
  }
};
