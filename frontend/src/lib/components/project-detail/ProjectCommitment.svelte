<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import CommitmentProgressBar from "$lib/components/project-detail/CommitmentProgressBar.svelte";
  import NfCommitmentProgressBar from "$lib/components/project-detail/NfCommitmentProgressBar.svelte";
  import { getMaxNeuronsFundParticipation } from "$lib/getters/sns-summary";
  import { i18n } from "$lib/stores/i18n";
  import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import {
    getProjectCommitmentSplit,
    isCommitmentSplitWithNeuronsFund,
    type ProjectCommitmentSplit,
  } from "$lib/utils/projects.utils";
  import { swapSaleBuyerCount } from "$lib/utils/sns-swap.utils";
  import {
    Html,
    KeyValuePair,
    KeyValuePairInfo,
  } from "@dfinity/gix-components";
  import { ICPToken, TokenAmountV2, nonNullish } from "@dfinity/utils";
  import { getContext } from "svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummaryWrapper;
  // type safety validation is done in ProjectStatusSection component
  $: summary = $projectDetailStore.summary as SnsSummaryWrapper;

  let min_icp_e8s: bigint;
  let max_icp_e8s: bigint;
  let min_participants: number;
  $: min_icp_e8s = summary.getMinIcpE8s();
  $: max_icp_e8s = summary.getMaxIcpE8s();
  $: min_participants = summary.getMinParticipants();

  let projectCommitments: ProjectCommitmentSplit;
  $: projectCommitments = getProjectCommitmentSplit(summary);

  let buyersTotalCommitment: bigint;
  $: buyersTotalCommitment = projectCommitments.totalCommitmentE8s;

  let buyersTotalCommitmentIcp: TokenAmountV2;
  $: buyersTotalCommitmentIcp = TokenAmountV2.fromUlps({
    amount: buyersTotalCommitment,
    token: ICPToken,
  });

  let saleBuyerCount: number | undefined;
  $: saleBuyerCount = swapSaleBuyerCount({
    rootCanisterId: $projectDetailStore?.summary?.rootCanisterId,
    swapMetrics: $snsSwapMetricsStore,
    derivedState: summary.derived,
  });

  let isMinParticipationReached: boolean;
  $: isMinParticipationReached = isCommitmentSplitWithNeuronsFund(
    projectCommitments
  )
    ? projectCommitments.directCommitmentE8s >=
      projectCommitments.minDirectCommitmentE8s
    : false;
  let isMinParticipantsReached: boolean;
  $: isMinParticipantsReached =
    nonNullish(saleBuyerCount) && saleBuyerCount >= min_participants;

  let maxNfParticipation: bigint | undefined;
  $: maxNfParticipation = getMaxNeuronsFundParticipation(summary);
</script>

<TestIdWrapper testId="project-commitment-component">
  {#if nonNullish(saleBuyerCount)}
    <KeyValuePair>
      <span slot="key" class="description">
        {$i18n.sns_project_detail.current_sale_buyer_count}
      </span>
      <span slot="value" data-tid="sns-project-current-sale-buyer-count"
        >{saleBuyerCount}</span
      >
    </KeyValuePair>
  {/if}
  {#if isMinParticipationReached && isMinParticipantsReached}
    <p
      data-tid="min-participation-reached"
      class="content-cell-island__card min-participation-reached"
    >
      {$i18n.sns_project_detail.min_participation_reached}
    </p>
  {/if}
  {#if isCommitmentSplitWithNeuronsFund(projectCommitments)}
    <div class="commitment-progress-container">
      <KeyValuePair testId="sns-project-current-direct-commitment">
        <span slot="key" class="commitment-progress-bar-title">
          <span class="description"
            >{$i18n.sns_project_detail.current_direct_commitment}</span
          >
        </span>

        <AmountDisplay
          slot="value"
          amount={TokenAmountV2.fromUlps({
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
    </div>

    <!-- Extra div is needed because KeyValuePairInfo renders two components. -->
    <!-- The spacing between component is set using flex in the parent. -->
    <div class="commitment-progress-container">
      <KeyValuePairInfo testId="sns-project-current-nf-commitment">
        <span
          slot="key"
          class="commitment-progress-bar-title commitment-progress-bar-title__nf"
        >
          <span class="description"
            >{$i18n.sns_project_detail.current_nf_commitment}</span
          >
        </span>

        <div slot="info" class="description">
          <Html
            text={$i18n.sns_project_detail.current_nf_commitment_description}
          />
        </div>

        <svelte:fragment slot="value">
          {#if projectCommitments.isNFParticipating && nonNullish(projectCommitments.nfCommitmentE8s)}
            <AmountDisplay
              amount={TokenAmountV2.fromUlps({
                amount: projectCommitments.nfCommitmentE8s,
                token: ICPToken,
              })}
              singleLine
            />
          {:else}
            <span>{$i18n.sns_project_detail.not_participating}</span>
          {/if}
        </svelte:fragment>
      </KeyValuePairInfo>
      {#if projectCommitments.isNFParticipating && nonNullish(projectCommitments.nfCommitmentE8s) && nonNullish(maxNfParticipation)}
        <NfCommitmentProgressBar
          maxCommitmentE8s={maxNfParticipation}
          commitmentE8s={projectCommitments.nfCommitmentE8s}
        />
      {/if}
    </div>
  {/if}
  <KeyValuePair testId="sns-project-current-commitment">
    <span slot="key" class="description">
      {$i18n.sns_project_detail.current_overall_commitment}
    </span>
    <AmountDisplay slot="value" amount={buyersTotalCommitmentIcp} singleLine />
  </KeyValuePair>
  <!-- deprecated -->
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
  // custom gap between text and the bar
  .commitment-progress-container {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .commitment-progress-bar-title {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    // This is the dot with the participation color next to the label
    &::before {
      content: "";
      display: block;
      flex-shrink: 0;

      height: var(--padding);
      width: var(--padding);

      border-radius: var(--padding);
      background: var(--primary);
    }

    &__nf {
      &::before {
        background: var(--warning-emphasis);
      }
    }
  }

  .min-participation-reached {
    margin: 0;
  }
</style>
