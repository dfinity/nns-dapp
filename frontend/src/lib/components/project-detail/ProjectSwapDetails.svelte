<script lang="ts">
  import { ICP, TokenAmount } from "@dfinity/nns";
  import type { SnsSummary, SnsSummarySwap } from "../../types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
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

  let minCommitmentIcp: TokenAmount;
  $: minCommitmentIcp = TokenAmount.fromE8s({
    amount: init.min_participant_icp_e8s,
  });
  let maxCommitmentIcp: TokenAmount;
  $: maxCommitmentIcp = TokenAmount.fromE8s({
    amount: init.max_participant_icp_e8s,
  });
</script>

<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.min_commitment} </span>
  <AmountDisplay slot="value" amount={minCommitmentIcp} singleLine />
</KeyValuePair>
<KeyValuePair>
  <span slot="key">{$i18n.sns_project_detail.max_commitment} </span>
  <AmountDisplay slot="value" amount={maxCommitmentIcp} singleLine />
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
