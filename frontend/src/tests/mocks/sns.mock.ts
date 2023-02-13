import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "$lib/types/project-detail.context";
import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import ContextWrapperTest from "../lib/components/ContextWrapperTest.svelte";
import {nowInSeconds} from "$lib/utils/date.utils";
import type {Principal} from "@dfinity/principal";
import {mockPrincipal} from "./auth.store.mock";
import {numberToE8s} from "$lib/utils/token.utils";
import type {Ticket} from "@dfinity/sns/dist/candid/sns_swap";
import type {SnsTicket} from "$lib/services/sns-sale.services";

export const snsTicketMock = ({
  rootCanisterId,
  owner
                               }: {rootCanisterId: Principal; owner: Principal}): SnsTicket => ({
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
  }
});

export const renderContextCmp = ({
  Component,
  summary,
  swapCommitment,
}: {
  summary?: SnsSummary;
  swapCommitment?: SnsSwapCommitment;
  Component: typeof SvelteComponent;
}) =>
  render(ContextWrapperTest, {
    props: {
      contextKey: PROJECT_DETAIL_CONTEXT_KEY,
      contextValue: {
        store: writable<ProjectDetailStore>({
          summary,
          swapCommitment,
        }),
      } as ProjectDetailContext,
      Component,
    },
  });
