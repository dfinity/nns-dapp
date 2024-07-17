<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createIsSnsFinalizingStore } from "$lib/stores/sns-finalization-status.store";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { keyOf } from "$lib/utils/utils";
  import { Tag } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { getContext } from "svelte";
  import type { Readable } from "svelte/store";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummaryWrapper;
  // type safety validation is done in ProjectStatusSection component
  $: summary = $projectDetailStore.summary as SnsSummaryWrapper;

  let rootCanisterId: Principal;
  $: rootCanisterId = summary.rootCanisterId;

  const statusTextMapper = {
    [SnsSwapLifecycle.Unspecified]: $i18n.sns_project_detail.status_unspecified,
    [SnsSwapLifecycle.Pending]: $i18n.sns_project_detail.status_pending,
    [SnsSwapLifecycle.Open]: $i18n.sns_project_detail.status_open,
    [SnsSwapLifecycle.Committed]: $i18n.sns_project_detail.status_committed,
    [SnsSwapLifecycle.Aborted]: $i18n.sns_project_detail.status_aborted,
    [SnsSwapLifecycle.Adopted]: $i18n.sns_project_detail.status_adopted,
  };

  let lifecycle: number;
  $: lifecycle = summary.getLifecycle();

  let isFinalizingStore: Readable<boolean>;
  $: isFinalizingStore = createIsSnsFinalizingStore(rootCanisterId);

  let lifeCycleStatusText: string;
  $: lifeCycleStatusText = keyOf({ obj: statusTextMapper, key: lifecycle });

  // The finalizing is not a lifecycle status. Instead, is calculated based on a response from the canister.
  let statusText: string;
  $: statusText = $isFinalizingStore
    ? $i18n.sns_project_detail.status_finalizing
    : lifeCycleStatusText;
</script>

<div data-tid="project-status-component">
  <h2 class="content-cell-title">{$i18n.sns_project_detail.status}</h2>
  <Tag intent={lifecycle === SnsSwapLifecycle.Open ? "success" : "info"}
    >{statusText}</Tag
  >
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: calc(var(--padding-0_5x) / 2);
  }
</style>
