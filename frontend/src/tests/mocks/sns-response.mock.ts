import type { SnsSummarySwap } from "$lib/types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import type { Principal } from "@dfinity/principal";
import type {
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import { nonNullish, toNullable } from "@dfinity/utils";
import {
  mockDerived,
  mockInit,
  mockQueryMetadataResponse,
  mockQueryTokenResponse,
  principal,
  summaryForLifecycle,
} from "./sns-projects.mock";
import {
  governanceCanisterIdMock,
  indexCanisterIdMock,
  ledgerCanisterIdMock,
  swapCanisterIdMock,
} from "./sns.api.mock";

const swapToQuerySwap = (swap: SnsSummarySwap): [SnsSwap] => [
  {
    ...swap,
    already_tried_to_auto_finalize: swap.already_tried_to_auto_finalize,
    decentralization_sale_open_timestamp_seconds: toNullable(
      swap.decentralization_sale_open_timestamp_seconds
    ),
    params: [{ ...swap.params }],

    next_ticket_id: [],
    purge_old_tickets_last_completion_timestamp_nanoseconds: [],
    purge_old_tickets_next_principal: [],
  },
];

export const snsResponseFor = ({
  principal,
  lifecycle,
  certified = false,
  restrictedCountries,
  directParticipantCount,
  projectName,
}: {
  principal: Principal;
  lifecycle: SnsSwapLifecycle;
  certified?: boolean;
  restrictedCountries?: string[];
  directParticipantCount?: [] | [bigint];
  projectName?: string;
}): [QuerySnsMetadata[], QuerySnsSwapState[]] => [
  [
    {
      metadata: {
        ...mockQueryMetadataResponse,
        name: nonNullish(projectName)
          ? [projectName]
          : mockQueryMetadataResponse.name,
      },
      token: mockQueryTokenResponse,
      rootCanisterId: principal.toText(),
      certified,
    },
  ],
  [
    {
      rootCanisterId: principal.toText(),
      swapCanisterId: swapCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      indexCanisterId: indexCanisterIdMock,
      swap: swapToQuerySwap({
        ...summaryForLifecycle(lifecycle).swap,
        init: [
          {
            ...mockInit,
            restricted_countries: nonNullish(restrictedCountries)
              ? [{ iso_codes: restrictedCountries }]
              : [],
          },
        ],
      }),
      derived: [
        {
          ...mockDerived,
          direct_participant_count:
            directParticipantCount ?? mockDerived.direct_participant_count,
        },
      ] as [SnsSwapDerivedState],
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

export const snsResponsesFor = (
  params: {
    principal: Principal;
    lifecycle: SnsSwapLifecycle;
    certified?: boolean;
  }[]
): [QuerySnsMetadata[], QuerySnsSwapState[]] =>
  mergeSnsResponses(params.map(snsResponseFor));

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
