<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary, SnsSummarySwap } from "../../types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import Icp from "../ic/ICP.svelte";
  import { i18n } from "../../stores/i18n";
  import type { SnsSwapInit } from "@dfinity/sns";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
  } from "../../utils/projects.utils";
  import DateSeconds from "../ui/DateSeconds.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectDetail component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let init: SnsSwapInit;
  $: ({ init } = swap);

  let minCommitmentIcp: ICP;
  $: minCommitmentIcp = ICP.fromE8s(init.min_participant_icp_e8s);
  let maxCommitmentIcp: ICP;
  $: maxCommitmentIcp = ICP.fromE8s(init.max_participant_icp_e8s);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);
  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);
</script>

<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.min_commitment} </span>
  <Icp slot="value" icp={minCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.max_commitment} </span>
  <Icp slot="value" icp={maxCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.sale_start} </span>
  <DateSeconds slot="value" seconds={Number(durationTillStart ?? BigInt(0))} tagName="span"/>
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.sale_end} </span>
  <DateSeconds slot="value" seconds={Number(durationTillDeadline ?? BigInt(0))} tagName="span"/>
</KeyValuePair>

<style lang="scss">
  p {
    font-size: var(--font-size-small);
  }
</style>
