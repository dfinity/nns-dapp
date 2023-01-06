<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import { loadProposalPayload } from "$lib/services/$public/proposals.services";
  import { proposalPayloadsStore } from "$lib/stores/proposals.store";
  import type { Proposal } from "@dfinity/nns";
  import { getNnsFunctionKey } from "$lib/utils/proposals.utils";
  import { expandObject, isNullish } from "$lib/utils/utils";
  import ProposalProposerPayloadEntry from "./ProposalProposerPayloadEntry.svelte";

  export let proposalId: ProposalId | undefined;
  export let proposal: Proposal | undefined;

  let payload: object | undefined | null;
  let expandedPayload: object | undefined | null;
  $: expandedPayload = isNullish(payload)
    ? payload
    : expandObject(payload as Record<string, unknown>);

  $: $proposalPayloadsStore,
    (payload =
      proposalId !== undefined
        ? $proposalPayloadsStore.get(proposalId)
        : undefined);
  $: if (
    proposalId !== undefined &&
    nnsFunctionKey !== undefined &&
    !$proposalPayloadsStore.has(proposalId)
  ) {
    loadProposalPayload({
      proposalId,
    });
  }

  let nnsFunctionKey: string | undefined;
  $: nnsFunctionKey = getNnsFunctionKey(proposal);
</script>

<ProposalProposerPayloadEntry {payload} />
