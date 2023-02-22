import type { SnsSummarySwap } from "$lib/types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import type { Principal } from "@dfinity/principal";
import type {
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import { toNullable } from "@dfinity/utils";
import {
  mockDerived,
  mockQueryMetadata,
  principal,
  summaryForLifecycle,
} from "./sns-projects.mock";
import { governanceCanisterIdMock, swapCanisterIdMock } from "./sns.api.mock";

const swapToQuerySwap = (swap: SnsSummarySwap): [SnsSwap] => [
  {
    ...swap,
    decentralization_sale_open_timestamp_seconds: toNullable(
      swap.decentralization_sale_open_timestamp_seconds
    ),
    params: [{ ...swap.params }],
  },
];

export const snsResponseFor = ({
  principal,
  lifecycle,
  certified = false,
}: {
  principal: Principal;
  lifecycle: SnsSwapLifecycle;
  certified?: boolean;
}): [QuerySnsMetadata[], QuerySnsSwapState[]] => [
  [
    {
      ...mockQueryMetadata,
      rootCanisterId: principal.toText(),
      certified,
    },
  ],
  [
    {
      rootCanisterId: principal.toText(),
      swapCanisterId: swapCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swap: swapToQuerySwap(summaryForLifecycle(lifecycle).swap),
      derived: [mockDerived] as [SnsSwapDerivedState],
      certified,
    },
  ],
];

const mergeSnsResponses = (
  responses: [QuerySnsMetadata[], QuerySnsSwapState[]][]
): [QuerySnsMetadata[], QuerySnsSwapState[]] => {
  const metadata = responses.flatMap(([meta, _]) => meta);
  const swapState = responses.flatMap(([_, state]) => state);
  return [metadata, swapState];
};

export const snsResponsesForLifecycle = ({
  certified = false,
  lifecycles,
}: {
  lifecycles: SnsSwapLifecycle[];
  certified?: boolean;
}): [QuerySnsMetadata[], QuerySnsSwapState[]] =>
  mergeSnsResponses(
    lifecycles.map((lifecycle, i) =>
      snsResponseFor({
        principal: principal(i),
        lifecycle,
        certified,
      })
    )
  );
