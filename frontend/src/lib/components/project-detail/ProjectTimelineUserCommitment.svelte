<script lang="ts">
  import type {
    SnsSummary,
    SnsSummarySwap,
    SnsSwapCommitment,
  } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
  } from "$lib/utils/projects.utils";
  import { secondsToDuration } from "@dfinity/utils";
  import { Value, KeyValuePair } from "@dfinity/gix-components";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import ProjectUserCommitmentLabel from "./ProjectUserCommitmentLabel.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import Separator from "../ui/Separator.svelte";

  export let myCommitment: TokenAmount | undefined;
  export let summary: SnsSummary;
  export let swapCommitment: SnsSwapCommitment | undefined | null;

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = summary);

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);

  let isOpen: boolean;
  $: isOpen = swap.lifecycle === SnsSwapLifecycle.Open;

  let isAdopted: boolean;
  $: isAdopted = swap.lifecycle === SnsSwapLifecycle.Adopted;

  let hasParticipated: boolean;
  $: hasParticipated =
    nonNullish(myCommitment) && myCommitment.toE8s() > BigInt(0);

  let dataIsRendered: boolean;
  $: dataIsRendered = isOpen || isAdopted || hasParticipated;
</script>

<!-- The data is separated by Separators. But we don't want them if nothing is rendered. -->
{#if dataIsRendered}
  <Separator spacing="none" />
{/if}
{#if isOpen && nonNullish(durationTillDeadline)}
  <KeyValuePair>
    <span slot="key">
      {$i18n.sns_project_detail.deadline}
    </span>
    <Value slot="value">
      {secondsToDuration({ seconds: durationTillDeadline, i18n: $i18n.time })}
    </Value>
  </KeyValuePair>
{/if}
{#if isAdopted && nonNullish(durationTillStart)}
  <KeyValuePair>
    <span slot="key">
      {$i18n.sns_project_detail.starts}
    </span>
    <Value slot="value">
      {secondsToDuration({ seconds: durationTillStart, i18n: $i18n.time })}
    </Value>
  </KeyValuePair>
{/if}
{#if hasParticipated && nonNullish(myCommitment)}
  <div>
    <KeyValuePair testId="sns-user-commitment">
      <ProjectUserCommitmentLabel slot="key" {summary} {swapCommitment} />
      <AmountDisplay slot="value" amount={myCommitment} singleLine />
    </KeyValuePair>
  </div>
{/if}
{#if dataIsRendered}
  <Separator spacing="none" />
{/if}
