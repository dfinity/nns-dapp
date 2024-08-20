<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSwapCommitment } from "$lib/types/sns";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { canUserParticipateToSwap } from "$lib/utils/projects.utils";

  export let summary: SnsSummaryWrapper | undefined | null;
  export let swapCommitment: SnsSwapCommitment | undefined | null;

  let canParticipate = false;
  $: canParticipate = canUserParticipateToSwap({ summary, swapCommitment });
</script>

<!-- This component renders the label about user commitment. If user effectively participate to swap should be tested where it is consumed -->

<span class="description">
  {#if canParticipate}
    {$i18n.sns_project_detail.user_current_commitment}
  {:else}
    {$i18n.sns_project_detail.user_commitment}
  {/if}
</span>
