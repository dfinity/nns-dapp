<script lang="ts">
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import type { SnsSummary } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import {
    Html,
    KeyValuePair,
    KeyValuePairInfo,
  } from "@dfinity/gix-components";
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
    isCommitmentSplitWithNeuronsFund,
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
  {#if isCommitmentSplitWithNeuronsFund(projectCommitments)}
    <KeyValuePair testId="sns-project-current-direct-commitment">
      <span slot="key" class="direct-participation">
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
        max={projectCommitments.maxDirectCommitmentE8s}
        minimumIndicator={projectCommitments.minDirectCommitmentE8s}
        color="primary"
      />
    </div>
    <!-- Extra div is needed because KeyValuePairInfo renders two components. -->
    <!-- The spacing between component is set using flex in the parent. -->
    <div>
      <KeyValuePairInfo testId="sns-project-current-nf-commitment">
        <svelte:fragment slot="key">
          {$i18n.sns_project_detail.current_nf_commitment}
        </svelte:fragment>

        <div slot="info" class="description">
          <Html
            text={$i18n.sns_project_detail.current_nf_commitment_description}
          />
        </div>

        <svelte:fragment slot="value">
          {#if projectCommitments.nfCommitmentE8s === null}
            <span>{$i18n.core.not_applicable}</span>
          {:else}
            <AmountDisplay
              amount={TokenAmount.fromE8s({
                amount: projectCommitments.nfCommitmentE8s,
                token: ICPToken,
              })}
              singleLine
            />
          {/if}
        </svelte:fragment>
      </KeyValuePairInfo>
    </div>
  {/if}
  <KeyValuePair testId="sns-project-current-commitment">
    <span slot="key">
      {$i18n.sns_project_detail.current_overall_commitment}
    </span>

    <AmountDisplay slot="value" amount={buyersTotalCommitmentIcp} singleLine />
  </KeyValuePair>
  {#if !isCommitmentSplitWithNeuronsFund(projectCommitments)}
    <div data-tid="sns-project-commitment-progress">
      <CommitmentProgressBar
        participationE8s={projectCommitments.totalCommitmentE8s}
        max={max_icp_e8s}
        minimumIndicator={min_icp_e8s}
        color="warning"
      />
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .direct-participation {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    // This is the dot with the participation color next to the label
    &::before {
      content: "";
      display: block;

      height: var(--padding);
      width: var(--padding);

      border-radius: var(--padding);
      background: var(--primary);
    }
  }
</style>
