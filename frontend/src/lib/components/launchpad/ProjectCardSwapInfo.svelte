<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import ProjectUserCommitmentLabel from "$lib/components/project-detail/ProjectUserCommitmentLabel.svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummarySwap, SnsSwapCommitment } from "$lib/types/sns";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
  } from "$lib/utils/projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import {
    ICPToken,
    TokenAmountV2,
    nonNullish,
    secondsToDuration,
  } from "@dfinity/utils";

  export let project: SnsFullProject;
  // The data to know whether it's finalizing or not is not in the SnsFullProject.
  export let isFinalizing: boolean;

  let summary: SnsSummaryWrapper;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let swap: SnsSummarySwap;
  $: ({ swap } = summary);

  let lifecycle: number;
  $: lifecycle = summary.getLifecycle();

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);

  let myCommitment: TokenAmountV2 | undefined = undefined;
  $: {
    const commitmentE8s = getCommitmentE8s(swapCommitment);
    if (nonNullish(commitmentE8s) && commitmentE8s > 0n) {
      myCommitment = TokenAmountV2.fromUlps({
        amount: commitmentE8s,
        token: ICPToken,
      });
    }
  }
</script>

<dl data-tid="project-card-swap-info-component">
  <TestIdWrapper testId="project-status-text">
    <!-- Sale is committed -->
    {#if lifecycle === SnsSwapLifecycle.Committed}
      <dt class="label">{$i18n.sns_project_detail.status_completed}</dt>
      <!-- is finalizing is not a lifecycle, it can be Committed and Finalizing or Not Finalizing -->
      {#if isFinalizing}
        <dd class="value">{$i18n.sns_project_detail.status_finalizing}</dd>
      {:else}
        <dd class="value">{$i18n.sns_project_detail.completed}</dd>
      {/if}
    {/if}

    <!-- Sale is adopted -->
    {#if lifecycle === SnsSwapLifecycle.Adopted && durationTillStart !== undefined}
      <dt class="label">{$i18n.sns_project_detail.starts}</dt>
      <dd class="value">
        {secondsToDuration({ seconds: durationTillStart, i18n: $i18n.time })}
      </dd>
    {/if}

    <!-- Sale is open -->
    {#if lifecycle === SnsSwapLifecycle.Open && durationTillDeadline !== undefined}
      <dt class="label">{$i18n.sns_project_detail.deadline}</dt>
      <dd class="value" data-tid="project-deadline">
        {secondsToDuration({ seconds: durationTillDeadline, i18n: $i18n.time })}
      </dd>
    {/if}
  </TestIdWrapper>

  {#if myCommitment !== undefined}
    <dt><ProjectUserCommitmentLabel {summary} {swapCommitment} /></dt>
    <dd data-tid="commitment-token-value">
      <AmountDisplay amount={myCommitment} singleLine size="inherit" />
    </dd>
  {/if}
</dl>

<style lang="scss">
  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--padding-1_5x);

    dd {
      text-align: right;
    }
  }
</style>
