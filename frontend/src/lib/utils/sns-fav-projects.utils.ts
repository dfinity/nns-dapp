import type { FavProject } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { Principal } from "@dfinity/principal";

export const toSnsFavProject = (rootCanisterId: Principal): FavProject => ({
  root_canister_id: rootCanisterId,
});

export const fromSnsFavProject = ({
  root_canister_id,
}: FavProject): Principal => root_canister_id;

export const isSnsProjectFavorite = ({
  project,
  favProjects,
}: {
  project: SnsFullProject;
  favProjects?: Principal[];
}): boolean =>
  favProjects?.some(
    (fav) => fav.toText() === project.rootCanisterId.toText()
  ) ?? false;
