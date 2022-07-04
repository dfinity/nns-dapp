import type { SnsFullProject } from "../stores/projects.store";

export const getSnsProjectById = ({
  id,
  projects,
}: {
  id?: string;
  projects?: SnsFullProject[];
}): SnsFullProject | undefined =>
  id === undefined
    ? undefined
    : projects?.find(
        ({ rootCanisterId }: SnsFullProject) => rootCanisterId.toText() === id
      );
