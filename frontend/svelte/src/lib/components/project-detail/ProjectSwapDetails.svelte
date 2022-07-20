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
  import InfoContextKey from "../ui/InfoContextKey.svelte";
  import { i18n } from "../../stores/i18n";
  import type { SnsSwapInit } from "@dfinity/sns";

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
</script>

<KeyValuePair>
  <InfoContextKey slot="key"
    ><svelte:fragment slot="header"
      >{$i18n.sns_project_detail.min_commitment}</svelte:fragment
    >
    <p>This is the text that is hidden and should appear on click</p>
  </InfoContextKey>
  <Icp slot="value" icp={minCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <InfoContextKey slot="key"
    ><svelte:fragment slot="header"
      >{$i18n.sns_project_detail.max_commitment}</svelte:fragment
    >
    <p>This should be an explanation of what does maximum commitment means</p>
  </InfoContextKey>
  <Icp slot="value" icp={maxCommitmentIcp} singleLine />
</KeyValuePair>

<style lang="scss">
  p {
    font-size: var(--font-size-small);
  }
</style>
