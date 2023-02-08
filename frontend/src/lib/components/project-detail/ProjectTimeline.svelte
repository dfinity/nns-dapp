<script lang="ts">
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummary, SnsSummarySwap } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
  } from "$lib/utils/projects.utils";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { Value, KeyValuePair } from "@dfinity/gix-components";
  import { SnsSwapLifecycle } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);
</script>

{#if durationTillDeadline && swap.lifecycle === SnsSwapLifecycle.Open}
  <KeyValuePair>
    <span slot="key">
      {$i18n.sns_project_detail.deadline}
    </span>
    <Value slot="value">
      {secondsToDuration(durationTillDeadline)}
    </Value>
  </KeyValuePair>
{/if}

{#if durationTillStart && swap.lifecycle === SnsSwapLifecycle.Adopted}
  <KeyValuePair>
    <span slot="key">
      {$i18n.sns_project_detail.starts}
    </span>
    <Value slot="value">
      {secondsToDuration(durationTillStart)}
    </Value>
  </KeyValuePair>
{/if}
