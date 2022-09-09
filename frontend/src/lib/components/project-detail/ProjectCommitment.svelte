<script lang="ts">
  import { TokenAmount } from "@dfinity/nns";
  import type { SnsSummary } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import CommitmentProgressBar from "./CommitmentProgressBar.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import type { SnsSummarySwap } from "../../types/sns";
  import type { SnsSwapDerivedState, SnsSwapInit } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  let derived: SnsSwapDerivedState;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap, derived } = $projectDetailStore.summary as SnsSummary);

  let init: SnsSwapInit;
  $: ({ init } = swap);

  let min_icp_e8s: bigint;
  let max_icp_e8s: bigint;
  $: ({ min_icp_e8s, max_icp_e8s } = init);

  let buyersTotalCommitment: bigint;
  $: ({ buyer_total_icp_e8s: buyersTotalCommitment } = derived);

  let buyersTotalCommitmentIcp: TokenAmount;
  $: buyersTotalCommitmentIcp = TokenAmount.fromE8s({
    amount: buyersTotalCommitment,
  });
</script>

<KeyValuePair testId="sns-project-current-commitment">
  <span slot="key">
    {$i18n.sns_project_detail.current_overall_commitment}
  </span>

  <AmountDisplay slot="value" amount={buyersTotalCommitmentIcp} singleLine />
</KeyValuePair>
<div data-tid="sns-project-commitment-progress">
  <CommitmentProgressBar
    value={buyersTotalCommitment}
    max={max_icp_e8s}
    minimumIndicator={min_icp_e8s}
  />
</div>
