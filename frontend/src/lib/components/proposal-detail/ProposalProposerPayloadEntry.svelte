<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import Json from "../common/Json.svelte";
  import { loadProposalPayload } from "$lib/services/$public/proposals.services";
  import { proposalPayloadsStore } from "$lib/stores/proposals.store";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";
  import type { Proposal } from "@dfinity/nns";
  import { getNnsFunctionKey } from "$lib/utils/proposals.utils";

  export let proposalId: ProposalId | undefined;
  export let proposal: Proposal | undefined;

  let payload: object | undefined | null;

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

{#if nnsFunctionKey !== undefined && proposalId !== undefined}
  <h2
    class="content-cell-title"
    data-tid="proposal-proposer-payload-entry-title"
  >
    {$i18n.proposal_detail.payload}
  </h2>

  <div class="content-cell-details">
    {#if payload !== undefined}
      <div class="json">
        <Json json={payload} />
      </div>
    {:else}
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    {/if}
  </div>
{/if}

<style lang="scss">
  .content-cell-title {
    margin-top: var(--padding-8x);
  }

  .json {
    word-break: break-word;
  }
</style>
