import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "$lib/types/project-detail.context";
import type { SnsSummary, SnsSwapCommitment, SnsTicket } from "$lib/types/sns";
import { nowInSeconds } from "$lib/utils/date.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import type { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";

export const snsTicketMock = ({
  rootCanisterId,
  owner,
}: {
  rootCanisterId: Principal;
  owner: Principal;
}): SnsTicket => ({
  rootCanisterId,
  ticket: {
    creation_time: BigInt(nowInSeconds()),
    ticket_id: 123n,
    account: [
      {
        owner: [owner],
        subaccount: [],
      },
    ],
    amount_icp_e8s: numberToE8s(10),
  },
});

export const renderContextCmp = ({
  Component,
  summary,
  swapCommitment,
  reload,
}: {
  summary?: SnsSummary;
  swapCommitment?: SnsSwapCommitment;
  Component: typeof SvelteComponent;
  reload?: () => void;
}) =>
  render(ContextWrapperTest, {
    props: {
      contextKey: PROJECT_DETAIL_CONTEXT_KEY,
      contextValue: {
        store: writable<ProjectDetailStore>({
          summary,
          swapCommitment,
        }),
        reload: reload === undefined ? jest.fn() : reload,
      } as ProjectDetailContext,
      Component,
    },
  });
