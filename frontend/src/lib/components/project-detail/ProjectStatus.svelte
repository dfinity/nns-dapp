<script lang="ts">
  import type { SnsSummary, SnsSummarySwap } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import Tag from "../ui/Tag.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import { SnsSwapLifecycle, type SnsSwapState } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectDetail component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let state: SnsSwapState;
  $: ({ state } = swap);

  const statusTextMapper = {
    [SnsSwapLifecycle.Unspecified]: $i18n.sns_project_detail.status_unspecified,
    [SnsSwapLifecycle.Pending]: $i18n.sns_project_detail.status_pending,
    [SnsSwapLifecycle.Open]: $i18n.sns_project_detail.status_open,
    [SnsSwapLifecycle.Committed]: $i18n.sns_project_detail.status_committed,
    [SnsSwapLifecycle.Aborted]: $i18n.sns_project_detail.status_aborted,
  };

  let lifecycle: number;
  $: lifecycle = state.lifecycle;
</script>

<div>
  <h2>{$i18n.sns_project_detail.status}</h2>
  <Tag>{statusTextMapper[lifecycle]}</Tag>
</div>

<style lang="scss">
  h2 {
    margin: 0;
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
