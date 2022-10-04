<script lang="ts">
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummary, SnsSummarySwap } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import { durationTillSwapDeadline } from "$lib/utils/projects.utils";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import Value from "../ui/Value.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

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
  <KeyValuePair>
    <span slot="key">
      {$i18n.sns_project_detail.deadline}
    </span>
    <Value slot="value">
      {secondsToDuration(durationTillDeadline)}
    </Value>
  </KeyValuePair>
{/if}
<div />
