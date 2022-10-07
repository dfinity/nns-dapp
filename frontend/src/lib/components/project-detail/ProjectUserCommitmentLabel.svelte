<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
  import { canUserParticipateToSwap } from "$lib/utils/projects.utils";

  export let summary: SnsSummary | undefined | null;
  export let swapCommitment: SnsSwapCommitment | undefined | null;

  let canParticipate = false;
  $: canParticipate = canUserParticipateToSwap({ summary, swapCommitment });
</script>

<!-- This component renders the label about user commitment. If user effectively participate to swap should be tested where it is consumed -->

{#if canParticipate}
  {$i18n.sns_project_detail.user_current_commitment}
{:else}
  {$i18n.sns_project_detail.user_commitment}
{/if}
