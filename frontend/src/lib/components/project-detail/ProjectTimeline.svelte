<script lang="ts">
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import type { SnsSummary, SnsSummarySwap } from "../../types/sns";
  import ProgressBar from "../ui/ProgressBar.svelte";
  import { i18n } from "../../stores/i18n";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
    swapDuration,
  } from "../../utils/projects.utils";
  import { secondsToDuration } from "../../utils/date.utils";
  import Value from "../ui/Value.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);
  let durationSeconds: bigint | undefined;
  $: durationSeconds = swapDuration(swap);
  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);
</script>

{#if durationTillDeadline !== undefined && durationSeconds !== undefined && durationTillStart !== undefined}
  <div>
    <ProgressBar
      value={Number(durationTillStart)}
      max={Number(durationSeconds)}
      color="blue"
    >
      <p slot="top" class="push-apart">
        <span>
          {$i18n.sns_project_detail.deadline}
        </span>
        <Value>
          {secondsToDuration(durationTillDeadline)}
        </Value>
      </p>
    </ProgressBar>
  </div>
{/if}

<style lang="scss">
  p {
    margin: 0;
  }

  .push-apart {
    display: flex;
    justify-content: space-between;
  }
</style>
