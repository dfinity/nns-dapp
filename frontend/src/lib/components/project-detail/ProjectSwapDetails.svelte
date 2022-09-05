<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSummary, SnsSummarySwap } from "../../types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import AmountTokens from "../ic/AmountTokens.svelte";
  import { i18n } from "../../stores/i18n";
  import type { SnsSwapInit } from "@dfinity/sns";
  import { openTimeWindow } from "../../utils/projects.utils";
  import DateSeconds from "../ui/DateSeconds.svelte";
  import type { SnsSwapTimeWindow } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectDetail component
  $: ({ swap } = $projectDetailStore.summary as SnsSummary);

  let init: SnsSwapInit;
  $: ({ init } = swap);

  let timeWindow: SnsSwapTimeWindow | undefined;
  $: timeWindow = openTimeWindow(swap);

  let start_timestamp_seconds: bigint | undefined;
  let end_timestamp_seconds: bigint | undefined;
  $: ({ start_timestamp_seconds, end_timestamp_seconds } = timeWindow ?? {
    start_timestamp_seconds: undefined,
    end_timestamp_seconds: undefined,
  });

  let minCommitmentIcp: ICP;
  $: minCommitmentIcp = ICP.fromE8s(init.min_participant_icp_e8s);
  let maxCommitmentIcp: ICP;
  $: maxCommitmentIcp = ICP.fromE8s(init.max_participant_icp_e8s);
</script>

<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.min_commitment} </span>
  <AmountTokens slot="value" amount={minCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.max_commitment} </span>
  <AmountTokens slot="value" amount={maxCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.sale_start} </span>
  <DateSeconds
    slot="value"
    seconds={Number(start_timestamp_seconds ?? BigInt(0))}
    tagName="span"
  />
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.sale_end} </span>
  <DateSeconds
    slot="value"
    seconds={Number(end_timestamp_seconds ?? BigInt(0))}
    tagName="span"
  />
</KeyValuePair>
