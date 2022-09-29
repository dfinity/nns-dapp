<script lang="ts">
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import type { SnsSummary, SnsSummarySwap } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import { durationTillSwapDeadline } from "../../utils/projects.utils";
  import { secondsToDuration } from "../../utils/date.utils";
  import Value from "../ui/Value.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);
</script>

{#if durationTillDeadline !== undefined}
  <p class="push-apart">
    <span>
      {$i18n.sns_project_detail.deadline}
    </span>
    <Value>
      {secondsToDuration(durationTillDeadline)}
    </Value>
  </p>
{/if}
<div />

<style lang="scss">
  p {
    margin: 0;
  }

  .push-apart {
    display: flex;
    justify-content: space-between;
  }
</style>
