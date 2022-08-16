import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import { OWN_CANISTER_ID } from "../../constants/canister-ids.constants";
import { AppPath } from "../../constants/routes.constants";
import { routeStore } from "../../stores/route.store";
import { isRoutePath } from "../../utils/app-path.utils";
import { isNnsProject } from "../../utils/projects.utils";
import { getQueryParam } from "../../utils/route.utils";
import { routePathSnsNeuronRootCanisterId } from "../../utils/sns-neuron.utils";

// Returns selected project from query params
// if no project is selected, returns NNS Dapp project
export const selectedProjectStore: Readable<Principal> = derived(
  routeStore,
  (route) => {
    let projectParam;
    try {
      if (
        isRoutePath({ path: AppPath.SnsNeuronDetail, routePath: route.path })
      ) {
        projectParam = routePathSnsNeuronRootCanisterId(route.path);
      } else {
        projectParam =
          route.query !== undefined
            ? getQueryParam({ key: "project", query: route.query })
            : undefined;
      }
      const projectId =
        projectParam !== undefined
          ? Principal.fromText(projectParam)
          : OWN_CANISTER_ID;
      return projectId;
    } catch {
      console.log("in da catch");
      return OWN_CANISTER_ID;
    }
  }
);

/***
 * Is the selected project (universe) Nns?
 */
export const isNnsProjectStore = derived(
  selectedProjectStore,
  ($selectedProjectStore: Principal) => isNnsProject($selectedProjectStore)
);

/***
 * Returns undefined if the selected project is NNS, otherwise returns the selected project principal.
 */
export const snsOnlyProjectStore = derived(
  selectedProjectStore,
  ($selectedProjectStore: Principal) =>
    isNnsProject($selectedProjectStore) ? undefined : $selectedProjectStore
);
