<script lang="ts">
  import { TokenAmount, ICPToken } from "@dfinity/utils";
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
  import type { SnsParams } from "@dfinity/sns";
  import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
  import { nonNullish } from "@dfinity/utils";
  import { swapSaleBuyerCount } from "$lib/utils/sns-swap.utils";
  import {
    getProjectCommitmentSplit,
    type ProjectCommitmentSplit,
  } from "$lib/utils/projects.utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary;
  // type safety validation is done in ProjectStatusSection component
  $: summary = $projectDetailStore.summary as SnsSummary;

  let params: SnsParams;
  $: ({ params } = summary.swap);

  let min_icp_e8s: bigint;
  let max_icp_e8s: bigint;
  $: ({ min_icp_e8s, max_icp_e8s } = params);

  let projectCommitments: ProjectCommitmentSplit;
  $: projectCommitments = getProjectCommitmentSplit(summary);

  let buyersTotalCommitment: bigint;
  $: buyersTotalCommitment = projectCommitments.totalCommitmentE8s;

  let buyersTotalCommitmentIcp: TokenAmount;
  $: buyersTotalCommitmentIcp = TokenAmount.fromE8s({
    amount: buyersTotalCommitment,
    token: ICPToken,
  });

  let saleBuyerCount: number | undefined;
  $: saleBuyerCount = swapSaleBuyerCount({
    rootCanisterId: $projectDetailStore?.summary?.rootCanisterId,
    swapMetrics: $snsSwapMetricsStore,
    derivedState: summary.derived,
  });
</script>

<TestIdWrapper testId="project-commitment-component">
  {#if nonNullish(saleBuyerCount)}
    <KeyValuePair>
      <span slot="key">
        {$i18n.sns_project_detail.current_sale_buyer_count}
      </span>
      <span slot="value" data-tid="sns-project-current-sale-buyer-count"
        >{saleBuyerCount}</span
      >
    </KeyValuePair>
  {/if}
  <KeyValuePair testId="sns-project-current-commitment">
    <span slot="key">
      {$i18n.sns_project_detail.current_overall_commitment}
    </span>

    <AmountDisplay slot="value" amount={buyersTotalCommitmentIcp} singleLine />
  </KeyValuePair>
  {#if "nfCommitmentE8s" in projectCommitments && projectCommitments.nfCommitmentE8s > 0n}
    <KeyValuePair testId="sns-project-current-direct-commitment">
      <span slot="key">
        {$i18n.sns_project_detail.current_direct_commitment}
      </span>

      <AmountDisplay
        slot="value"
        amount={TokenAmount.fromE8s({
          amount: projectCommitments.directCommitmentE8s,
          token: ICPToken,
        })}
        singleLine
      />
    </KeyValuePair>
    <div data-tid="sns-project-commitment-progress">
      <CommitmentProgressBar
        participationE8s={projectCommitments.directCommitmentE8s}
        max={max_icp_e8s}
        minimumIndicator={min_icp_e8s}
      />
    </div>
    <KeyValuePair testId="sns-project-current-nf-commitment">
      <span slot="key">
        {$i18n.sns_project_detail.current_nf_commitment}
      </span>

      <AmountDisplay
        slot="value"
        amount={TokenAmount.fromE8s({
          amount: projectCommitments.nfCommitmentE8s,
          token: ICPToken,
        })}
        singleLine
      />
    </KeyValuePair>
  {:else}
    <div data-tid="sns-project-commitment-progress">
      <CommitmentProgressBar
        participationE8s={projectCommitments.totalCommitmentE8s}
        max={max_icp_e8s}
        minimumIndicator={min_icp_e8s}
      />
    </div>
  {/if}
</TestIdWrapper>
