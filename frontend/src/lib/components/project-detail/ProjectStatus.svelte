<script lang="ts">
  import type { SnsSummary, SnsSummarySwap } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import Tag from "../ui/Tag.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { keyOf } from "$lib/utils/utils";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  const statusTextMapper = {
    [SnsSwapLifecycle.Unspecified]: $i18n.sns_project_detail.status_unspecified,
    [SnsSwapLifecycle.Pending]: $i18n.sns_project_detail.status_pending,
    [SnsSwapLifecycle.Open]: $i18n.sns_project_detail.status_open,
    [SnsSwapLifecycle.Committed]: $i18n.sns_project_detail.status_committed,
    [SnsSwapLifecycle.Aborted]: $i18n.sns_project_detail.status_aborted,
  };

  let lifecycle: number;
  $: ({ lifecycle } = swap);
</script>

<div>
  <h2 class="content-cell-title">{$i18n.sns_project_detail.status}</h2>
  <Tag>{keyOf({ obj: statusTextMapper, key: lifecycle })}</Tag>
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: calc(var(--padding-0_5x) / 2);
  }
</style>
