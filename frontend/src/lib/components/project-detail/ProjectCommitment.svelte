<script lang="ts">
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import type { SnsSummary } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import CommitmentProgressBar from "./CommitmentProgressBar.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummarySwap } from "$lib/types/sns";
  import type { SnsSwapDerivedState, SnsParams } from "@dfinity/sns";
  import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
  import { nonNullish } from "@dfinity/utils";
  import { swapSaleBuyerCount } from "$lib/utils/sns-swap.utils";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swap: SnsSummarySwap;
  let derived: SnsSwapDerivedState;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap, derived } = $projectDetailStore.summary as SnsSummary);

  let params: SnsParams;
  $: ({ params } = swap);

  let min_icp_e8s: bigint;
  let max_icp_e8s: bigint;
  $: ({ min_icp_e8s, max_icp_e8s } = params);

  let buyersTotalCommitment: bigint;
  $: ({ buyer_total_icp_e8s: buyersTotalCommitment } = derived);

  let buyersTotalCommitmentIcp: TokenAmount;
  $: buyersTotalCommitmentIcp = TokenAmount.fromE8s({
    amount: buyersTotalCommitment,
    token: ICPToken,
  });

  let saleBuyerCount: number | undefined;
  $: saleBuyerCount = swapSaleBuyerCount({
    rootCanisterId: $projectDetailStore?.summary?.rootCanisterId,
    swapMetrics: $snsSwapMetricsStore,
  });
</script>

{#if nonNullish(saleBuyerCount)}
  <KeyValuePair testId="sns-project-current-sale-buyer-count">
    <span slot="key">
      {$i18n.sns_project_detail.current_sale_buyer_count}
    </span>
    <span slot="value">{saleBuyerCount}</span>
  </KeyValuePair>
{/if}
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
