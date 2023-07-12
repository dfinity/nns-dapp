<script lang="ts">
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import type {
    SnsSummary,
    SnsSwapCommitment,
    SnsSummarySwap,
  } from "$lib/types/sns";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
  } from "$lib/utils/projects.utils";
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import ProjectUserCommitmentLabel from "$lib/components/project-detail/ProjectUserCommitmentLabel.svelte";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { nonNullish } from "@dfinity/utils";

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let swap: SnsSummarySwap;
  $: ({ swap } = summary);

  let lifecycle: number;
  $: ({
    swap: { lifecycle },
  } = summary);

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);

  let myCommitment: TokenAmount | undefined = undefined;
  $: {
    const commitmentE8s = getCommitmentE8s(swapCommitment);
    if (nonNullish(commitmentE8s) && commitmentE8s > BigInt(0)) {
      myCommitment = TokenAmount.fromE8s({
        amount: commitmentE8s,
        token: ICPToken,
      });
    }
  }
</script>

<dl data-tid="project-card-swap-info-component">
  <!-- Sale is committed -->
  {#if lifecycle === SnsSwapLifecycle.Committed}
    <dt>{$i18n.sns_project_detail.status_completed}</dt>
    <dd class="value">{$i18n.sns_project_detail.completed}</dd>
  {/if}

  <!-- Sale is adopted -->
  {#if lifecycle === SnsSwapLifecycle.Adopted && durationTillStart !== undefined}
    <dt>{$i18n.sns_project_detail.starts}</dt>
    <dd class="value">{secondsToDuration(durationTillStart)}</dd>
  {/if}

  <!-- Sale is open -->
  {#if lifecycle === SnsSwapLifecycle.Open && durationTillDeadline !== undefined}
    <dt>{$i18n.sns_project_detail.deadline}</dt>
    <dd class="value">{secondsToDuration(durationTillDeadline)}</dd>
  {/if}

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
