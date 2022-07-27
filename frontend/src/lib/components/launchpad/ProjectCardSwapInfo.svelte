<script lang="ts">
  import type { SnsFullProject } from "../../stores/projects.store";
  import type {
    SnsSummary,
    SnsSwapCommitment,
    SnsSummarySwap,
  } from "../../types/sns";
  import {durationTillSwapDeadline, durationTillSwapStart} from "../../utils/projects.utils";
  import { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import Icp from "../ic/ICP.svelte";
  import {SnsSwapLifecycle, type SnsSwapState} from '@dfinity/sns';

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let swap: SnsSummarySwap;
  $: ({ swap } = summary);

  let state: SnsSwapState;
  $: ({ state } = swap);

  let lifecycle: number;
  $: lifecycle = state.lifecycle;

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);

  export let myCommitment: ICP | undefined = undefined;
  $: myCommitment =
    swapCommitment?.myCommitment === undefined
      ? undefined
      : ICP.fromE8s(swapCommitment.myCommitment);
</script>

<dl>
  <!-- Sale is committed -->
  {#if lifecycle === SnsSwapLifecycle.Committed}
    <dt>{$i18n.sns_project_detail.completed}</dt>
  {/if}

  <!-- Sale is open -->
  {#if lifecycle === SnsSwapLifecycle.Open && durationTillDeadline !== undefined}
    <dt>{$i18n.sns_project_detail.deadline}</dt>
    <dd>{secondsToDuration(durationTillDeadline)}</dd>
  {/if}

  <!-- Sale starts soon -->
  {#if lifecycle === SnsSwapLifecycle.Pending && durationTillStart !== undefined}
    <dt>{$i18n.sns_project_detail.starts_in}</dt>
    <dd>{secondsToDuration(durationTillStart)}</dd>
  {/if}

  {#if myCommitment !== undefined}
    <dt>{$i18n.sns_project_detail.user_commitment}</dt>
    <dd><Icp icp={myCommitment} singleLine inheritSize /></dd>
  {/if}
</dl>

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
