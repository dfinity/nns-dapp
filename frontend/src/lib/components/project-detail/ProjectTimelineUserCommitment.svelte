<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummarySwap, SnsSwapCommitment } from "$lib/types/sns";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import {
    durationTillSwapDeadline,
    durationTillSwapStart,
  } from "$lib/utils/projects.utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import Separator from "../ui/Separator.svelte";
  import ProjectUserCommitmentLabel from "./ProjectUserCommitmentLabel.svelte";
  import { KeyValuePair, Value } from "@dfinity/gix-components";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import { secondsToDuration } from "@dfinity/utils";

  export let myCommitment: TokenAmount | undefined;
  export let summary: SnsSummaryWrapper;
  export let swapCommitment: SnsSwapCommitment | undefined | null;

  let swap: SnsSummarySwap;
  // type safety validation is done in ProjectStatusSection component
  $: ({ swap } = summary);

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let durationTillStart: bigint | undefined;
  $: durationTillStart = durationTillSwapStart(swap);

  let lifecycle: SnsSwapLifecycle;
  $: lifecycle = summary.getLifecycle();

  let isOpen: boolean;
  $: isOpen = lifecycle === SnsSwapLifecycle.Open;

  let isAdopted: boolean;
  $: isAdopted = lifecycle === SnsSwapLifecycle.Adopted;

  let hasParticipated: boolean;
  $: hasParticipated = nonNullish(myCommitment) && myCommitment.toE8s() > 0n;

  let dataIsRendered: boolean;
  $: dataIsRendered = isOpen || isAdopted || hasParticipated;
</script>

<!-- The data is separated by Separators. But we don't want them if nothing is rendered. -->
{#if dataIsRendered}
  <Separator spacing="none" />
{/if}
{#if isOpen && nonNullish(durationTillDeadline)}
  <KeyValuePair>
    <span slot="key" class="description">
      {$i18n.sns_project_detail.deadline}
    </span>
    <Value slot="value">
      {secondsToDuration({ seconds: durationTillDeadline, i18n: $i18n.time })}
    </Value>
  </KeyValuePair>
{/if}
{#if isAdopted && nonNullish(durationTillStart)}
  <KeyValuePair>
    <span slot="key" class="description">
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
