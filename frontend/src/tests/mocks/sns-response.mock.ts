import type {
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import type {
  QuerySnsSummary,
  QuerySnsSwapState,
} from "../../lib/types/sns.query";
import {
  mockDerived,
  mockSnsFullProject,
  principal,
  summaryForLifecycle,
} from "./sns-projects.mock";
import { swapCanisterIdMock } from "./sns.api.mock";

export const snsResponsesForLifecycle = ({
  certified = false,
  lifecycles,
}: {
  lifecycles: SnsSwapLifecycle[];
  certified?: boolean;
}): [QuerySnsSummary[], QuerySnsSwapState[]] => [
  [
    ...lifecycles.map((lifecycle, i) => ({
      ...mockSnsFullProject.summary,
      rootCanisterId: principal(i),
      certified,
    })),
  ],
  [
    ...lifecycles.map((lifecycle, i) => ({
      rootCanisterId: principal(i).toText(),
      swapCanisterId: swapCanisterIdMock,
      swap: [
        {
          init: [summaryForLifecycle(lifecycle).swap.init],
          state: [summaryForLifecycle(lifecycle).swap.state],
        },
      ] as [SnsSwap],
      derived: [mockDerived] as [SnsSwapDerivedState],
      certified,
    })),
  ],
];
