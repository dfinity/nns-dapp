<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import Json from "../common/Json.svelte";
  import { loadProposalPayload } from "../../services/proposals.services";
  import { proposalPayloadsStore } from "../../stores/proposals.store";
  import { i18n } from "../../stores/i18n";
  import SkeletonParagraph from "../ui/SkeletonParagraph.svelte";
  import type { Proposal } from "@dfinity/nns";
  import {getExecuteNnsFunctionId} from '../../utils/proposals.utils';

  export let proposalId: ProposalId | undefined;
  export let proposal: Proposal | undefined;

  let payload: object | undefined | null;

  $: $proposalPayloadsStore,
    (payload =
      proposalId !== undefined
        ? $proposalPayloadsStore.get(proposalId)
        : undefined);
  $: if (proposalId !== undefined && nnsFunctionId !== undefined && !$proposalPayloadsStore.has(proposalId)) {
    loadProposalPayload({
      proposalId,
    });
  }

  let nnsFunctionId: number | undefined;
  $: nnsFunctionId = getExecuteNnsFunctionId(proposal);
</script>

{#if nnsFunctionId !== undefined && proposalId !== undefined}
  <h2 class="content-cell-title" data-tid="proposal-proposer-payload-entry-title">{$i18n.proposal_detail.payload}</h2>

  <div class="content-cell-details">
    {#if payload !== undefined}
      <div>
        <Json json={payload} />
      </div>
    {:else}
      <SkeletonParagraph />
      <SkeletonParagraph />
      <SkeletonParagraph />
    {/if}
  </div>
{/if}

<style lang="scss">
  .content-cell-title {
    margin-top: var(--padding-8x);
  }
</style>
