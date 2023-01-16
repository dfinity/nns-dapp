<script lang="ts">
  import type { SnsFullProject } from "$lib/derived/projects.store";
  import type {
    SnsSummary,
    SnsSwapCommitment,
    SnsSummarySwap,
  } from "$lib/types/sns";
  import { durationTillSwapDeadline } from "$lib/utils/projects.utils";
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import ProjectUserCommitmentLabel from "$lib/components/project-detail/ProjectUserCommitmentLabel.svelte";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";

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

  let myCommitment: TokenAmount | undefined = undefined;
  $: {
    const commitmentE8s = getCommitmentE8s(swapCommitment);
    if (commitmentE8s !== undefined) {
      myCommitment = TokenAmount.fromE8s({
        amount: commitmentE8s,
        token: ICPToken,
      });
    }
  }
</script>

<dl>
  <!-- Sale is committed -->
  {#if lifecycle === SnsSwapLifecycle.Committed}
    <dt>{$i18n.sns_project_detail.status_completed}</dt>
    <dd class="value">{$i18n.sns_project_detail.completed}</dd>
  {/if}

  <!-- Sale is open -->
  {#if lifecycle === SnsSwapLifecycle.Open && durationTillDeadline !== undefined}
    <dt>{$i18n.sns_project_detail.deadline}</dt>
    <dd class="value">{secondsToDuration(durationTillDeadline)}</dd>
  {/if}

  {#if myCommitment !== undefined}
    <dt><ProjectUserCommitmentLabel {summary} {swapCommitment} /></dt>
    <dd><AmountDisplay amount={myCommitment} singleLine inheritSize /></dd>
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
