import type {
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import type {
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "../../lib/types/sns.query";
import {
  mockDerived,
  mockQueryMetadata,
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
}): [QuerySnsMetadata[], QuerySnsSwapState[]] => [
  [
    ...lifecycles.map((lifecycle, i) => ({
      ...mockQueryMetadata,
      rootCanisterId: principal(i).toText(),
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
