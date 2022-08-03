<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type {SnsSummary, SnsSwapCommitment} from '../../types/sns';

  export let summary: SnsSummary | undefined | null;
  export let swapCommitment: SnsSwapCommitment | undefined;

  // TODO: need can user participate to swap
  let canParticipate = false;
</script>

<!-- This component renders the label about user commitment. If user effectively participate to swap should be tested where it is consumed -->

{#if canParticipate}
  {$i18n.sns_project_detail.user_current_commitment}
{:else}
  {$i18n.sns_project_detail.user_commitment}
{/if}
