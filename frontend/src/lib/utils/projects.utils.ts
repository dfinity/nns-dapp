import { SnsSwapLifecycle } from "@dfinity/sns";
import type { SnsFullProject } from "../stores/projects.store";

const filterProjectsStatus = ({
  swapLifecycle,
  projects,
}: {
  swapLifecycle: SnsSwapLifecycle;
  projects: SnsFullProject[] | undefined;
}) =>
  projects?.filter(
    ({
      summary: {
        swap: {
          state: { lifecycle },
        },
      },
    }) => swapLifecycle === lifecycle
  );

export const filterCommittedProjects = (
  projects: SnsFullProject[] | undefined
) =>
  filterProjectsStatus({
    swapLifecycle: SnsSwapLifecycle.Committed,
    projects,
  });

/**
 * Projects displayed in the launchpad are displayed according status if:
 * - status is Pending and time window is defined - i.e. related proposal has been accepted (if not accepted, time window is undefined)
 * - open
 * - complete - we display completed project for a while to make the screen user-friendly
 * @param projects
 */
export const filterActiveProjects = (projects: SnsFullProject[] | undefined) =>
  projects?.filter(
    ({
      summary: {
        swap: {
          state: { lifecycle, open_time_window },
        },
      },
    }) =>
      [SnsSwapLifecycle.Committed, SnsSwapLifecycle.Open].includes(lifecycle) ||
      (SnsSwapLifecycle.Pending === lifecycle && open_time_window.length)
  );
