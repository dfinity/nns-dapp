import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import type {
  FavProject,
  FavProjects,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";

export const getFavProjects = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<FavProjects> => {
  logWithTimestamp(`Getting favorite projects:${certified} call...`);

  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  const response = await nnsDapp.getFavProjects({ certified });

  logWithTimestamp(`Getting favorite projects:${certified} complete`);

  return response;
};

export const setFavProjects = async ({
  identity,
  favProjects,
}: {
  identity: Identity;
  favProjects: Array<FavProject>;
}): Promise<void> => {
  logWithTimestamp("Setting favorite projects call...");

  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  await nnsDapp.setFavProjects(favProjects);

  logWithTimestamp("Setting favorite projects call complete.");
};
