<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { SnsProposalData } from "@dfinity/sns";
  import { fromNullable, nonNullish } from "@dfinity/utils";
  import ProposalSummary from "../proposal-detail/ProposalSummary.svelte";

  export let proposal: SnsProposalData;

  let payload: string | undefined;
  $: payload = fromNullable(proposal.payload_text_rendering);
</script>

{#if nonNullish(payload)}
  <div
    class="content-cell-island"
    data-tid="sns-proposal-payload-section-component"
  >
    <h2 class="content-cell-title">
      {$i18n.proposal_detail.payload}
    </h2>
    <div class="content-cell-details">
      <ProposalSummary summary={payload} />
    </div>
  </div>
{/if}
