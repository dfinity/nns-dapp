<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import Json from "../common/Json.svelte";
  import { loadProposalPayload } from "../../services/proposals.services";
  import { proposalPayloadsStore } from "../../stores/proposals.store";
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import { i18n } from "../../stores/i18n";
  import SkeletonParagraph from "../ui/SkeletonParagraph.svelte";

  export let proposalInfo: ProposalInfo;

  let id: ProposalId | undefined;
  $: ({ id } = mapProposalInfo(proposalInfo));

  export let payload: object | undefined | null;

  $: $proposalPayloadsStore,
    (payload = id !== undefined ? $proposalPayloadsStore.get(id) : undefined);
  $: if (id !== undefined && !$proposalPayloadsStore.has(id)) {
    loadProposalPayload({
      proposalId: id,
    });
  }
</script>

<h2 class="content-cell-title">{$i18n.proposal_detail.payload}</h2>

<div class="content-cell-details">
  {#if id !== undefined && payload !== undefined}
    <div>
      <Json json={payload} />
    </div>
  {:else}
    <SkeletonParagraph />
    <SkeletonParagraph />
    <SkeletonParagraph />
  {/if}
</div>
