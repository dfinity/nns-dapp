<script lang="ts">
  import type { SnsFullProject } from "../../stores/projects.store";
  import type {
    SnsSummary,
    SnsSwapCommitment,
    SnsSummarySwap,
  } from "../../types/sns";
  import { durationTillSwapDeadline } from "../../utils/projects.utils";
  import { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import Icp from "../ic/ICP.svelte";

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let swap: SnsSummarySwap;
  $: ({ swap } = summary);

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  export let myCommitment: ICP | undefined = undefined;
  $: myCommitment =
    swapCommitment?.myCommitment === undefined
      ? undefined
      : ICP.fromE8s(swapCommitment.myCommitment.amount_icp_e8s);
</script>

{#if durationTillDeadline !== undefined || myCommitment !== undefined}
  <dl>
    {#if durationTillDeadline !== undefined}
      <dt>{$i18n.sns_project.deadline}</dt>
      <dd>{secondsToDuration(durationTillDeadline)}</dd>
    {/if}

    {#if myCommitment !== undefined}
      <dt>{$i18n.sns_project.your_commitment}</dt>
      <dd><Icp icp={myCommitment} singleLine inheritSize /></dd>
    {/if}
  </dl>
{/if}

<style lang="scss">
  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--padding-1_5x);

    dt {
      opacity: var(--light-opacity);
    }

    dd {
      text-align: right;
    }
  }
</style>
