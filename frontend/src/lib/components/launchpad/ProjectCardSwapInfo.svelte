<script lang="ts">
  import type { SnsFullProject } from "../../stores/projects.store";
  import type {
    SnsSummary,
    SnsSwapCommitment,
    SnsSummarySwap,
  } from "../../types/sns";
  import { durationTillSwapDeadline } from "../../utils/projects.utils";
  import { TokenAmount } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import ProjectUserCommitmentLabel from "../project-detail/ProjectUserCommitmentLabel.svelte";
  import { getCommitmentE8s } from "../../utils/sns.utils";

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
