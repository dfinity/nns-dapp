<script lang="ts">
  import { loadProposalPayload } from "$lib/services/public/proposals.services";
  import { proposalPayloadsStore } from "$lib/stores/proposals.store";
  import { getNnsFunctionKey } from "$lib/utils/proposals.utils";
  import ProposalProposerPayloadEntry from "./ProposalProposerPayloadEntry.svelte";
  import type { Proposal } from "@dfinity/nns";
  import type { ProposalId } from "@dfinity/nns";

  export let proposalId: ProposalId | undefined;
  export let proposal: Proposal | undefined;

  let payload: object | undefined | null;
  // Only proposals with nnsFunctionKey and proposalId have payload
  let nnsFunctionKey: string | undefined;
  $: nnsFunctionKey = getNnsFunctionKey(proposal);

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
</script>

{#if nnsFunctionKey !== undefined && proposalId !== undefined}
  <ProposalProposerPayloadEntry {payload} />
{/if}
