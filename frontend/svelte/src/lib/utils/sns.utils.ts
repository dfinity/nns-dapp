import type { SnsSummary } from "../services/sns.mock";
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

export enum ProjectStatus {
  Accepting = "accepting",
  Pending = "pending",
  Closed = "closed",
}

export const getProjectStatus = ({
  summary,
  nowInSeconds,
}: {
  summary: SnsSummary;
  nowInSeconds: number;
}): ProjectStatus =>
  BigInt(nowInSeconds) > summary.swapDeadline
    ? ProjectStatus.Closed
    : nowInSeconds < summary.swapStart
    ? ProjectStatus.Pending
    : ProjectStatus.Accepting;
