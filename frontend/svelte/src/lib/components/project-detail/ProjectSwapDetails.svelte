<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary } from "../../types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import Icp from "../ic/ICP.svelte";
  import InfoContextKey from "../ui/InfoContextKey.svelte";
  import { i18n } from "../../stores/i18n";
  import type { SnsInit } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;

  let details: SnsInit;
  $: ({ details } = summary.swap);

  let minCommitmentIcp: ICP;
  $: minCommitmentIcp = ICP.fromE8s(details.min_participant_icp_e8s);
  let maxCommitmentIcp: ICP;
  $: maxCommitmentIcp = ICP.fromE8s(details.max_participant_icp_e8s);
</script>

<KeyValuePair>
  <InfoContextKey slot="key"
    ><svelte:fragment slot="header"
      >{$i18n.sns_project_detail.min_commitment}</svelte:fragment
    >
    <p class="small">
      This is the text that is hidden and should appear on click
    </p>
  </InfoContextKey>
  <Icp slot="value" icp={minCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <InfoContextKey slot="key"
    ><svelte:fragment slot="header"
      >{$i18n.sns_project_detail.max_commitment}</svelte:fragment
    >
    <p class="small">
      This should be an explanation of what does maximum commitment means
    </p>
  </InfoContextKey>
  <Icp slot="value" icp={maxCommitmentIcp} singleLine />
</KeyValuePair>
