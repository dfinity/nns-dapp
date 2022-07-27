import type { SnsSwap, SnsSwapLifecycle } from "@dfinity/sns";
import type {
  QuerySnsSummary,
  QuerySnsSwapState,
} from "../../lib/types/sns.query";
import {
  mockSnsFullProject,
  principal,
  summaryForLifecycle,
} from "./sns-projects.mock";

export const snsResponsesForLifecycle = ({
  certified = false,
  lifecycles,
}: {
  lifecycles: SnsSwapLifecycle[];
  certified?: boolean;
}): {
  response: [QuerySnsSummary[], QuerySnsSwapState[]];
  certified: boolean;
} => ({
  response: [
    [
      ...lifecycles.map((lifecycle, i) => ({
        ...mockSnsFullProject.summary,
        rootCanisterId: principal(i),
      })),
    ],
    [
      ...lifecycles.map((lifecycle, i) => ({
        rootCanisterId: principal(i).toText(),
        swap: [
          {
            init: [summaryForLifecycle(lifecycle).swap.init],
            state: [summaryForLifecycle(lifecycle).swap.state],
          },
        ] as [SnsSwap],
      })),
    ],
  ],
  certified,
});
