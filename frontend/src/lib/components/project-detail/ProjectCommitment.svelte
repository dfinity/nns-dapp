<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import CommitmentProgressBar from "./CommitmentProgressBar.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import type { SnsSummarySwap } from "../../types/sns";
  import type { SnsSwapInit } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let init: SnsSwapInit;
  $: ({ init } = swap);

  let min_icp_e8s: bigint;
  let max_icp_e8s: bigint;
  $: ({ min_icp_e8s, max_icp_e8s } = init);

  let currentCommitment: bigint;
  $: currentCommitment =
    $projectDetailStore.swapCommitment?.currentCommitment ?? BigInt(0);

  let currentCommitmentIcp: ICP;
  $: currentCommitmentIcp = ICP.fromE8s(currentCommitment);
</script>

<KeyValuePair testId="sns-project-current-commitment">
  <span slot="key">
    {$i18n.sns_project_detail.current_commitment}
  </span>
  <Icp slot="value" icp={currentCommitmentIcp} singleLine />
</KeyValuePair>
<div data-tid="sns-project-commitment-progress">
  <CommitmentProgressBar
    value={currentCommitment}
    max={max_icp_e8s}
    minimumIndicator={min_icp_e8s}
  />
</div>

<style lang="scss">
  p {
    margin: 0;
  }
</style>
