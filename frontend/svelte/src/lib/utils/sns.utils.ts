import type { SnsFullProject } from "../stores/snsProjects.store";

export const getSnsProjectById = ({
  id,
  projects,
}: {
  id?: string;
  projects?: SnsFullProject[];
}): SnsFullProject | undefined =>
  projects?.find(
    ({ rootCanisterId }: SnsFullProject) => rootCanisterId.toText() === id
  );
