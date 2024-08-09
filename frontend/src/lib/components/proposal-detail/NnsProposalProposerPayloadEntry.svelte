<script lang="ts">
  import { loadProposalPayload } from "$lib/services/$public/proposals.services";
  import { proposalPayloadsStore } from "$lib/stores/proposals.store";
  import { hasProposalPayload } from "$lib/utils/proposals.utils";
  import ProposalProposerPayloadEntry from "./ProposalProposerPayloadEntry.svelte";
  import type { Proposal } from "@dfinity/nns";
  import type { ProposalId } from "@dfinity/nns";

  export let proposalId: ProposalId | undefined;
  export let proposal: Proposal | undefined;

  let payload: object | undefined | null;
  // Only proposals with nnsFunctionKey and proposalId have payload
  let shouldDisplayPayload: boolean;
  $: shouldDisplayPayload = hasProposalPayload(proposal);

  $: $proposalPayloadsStore,
    (payload =
      proposalId !== undefined
        ? $proposalPayloadsStore.get(proposalId)
        : undefined);
  $: if (
    proposalId !== undefined &&
    shouldDisplayPayload &&
    !$proposalPayloadsStore.has(proposalId)
  ) {
    loadProposalPayload({
      proposalId,
    });
  }
</script>

{#if shouldDisplayPayload && proposalId !== undefined}
  <ProposalProposerPayloadEntry {payload} />
{/if}
