import type { TableProject } from "$lib/types/staking";
import type { Universe } from "$lib/types/universe";
import { buildNeuronsUrl } from "$lib/utils/navigation.utils";

export const getTableProjects = ({
  universes,
}: {
  universes: Universe[];
}): TableProject[] => {
  return universes.map((universe) => ({
    rowHref: buildNeuronsUrl({ universe: universe.canisterId }),
    domKey: universe.canisterId,
    title: universe.title,
    logo: universe.logo,
  }));
};
