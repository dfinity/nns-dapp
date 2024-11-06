<script lang="ts">
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    dissolveDelayMultiplier,
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import DissolveDelayBonusText from "./DissolveDelayBonusText.svelte";
  import IncreaseDissolveDelayButton from "./actions/IncreaseDissolveDelayButton.svelte";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import { ICPToken, secondsToDuration } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let dissolveBonus: number;
  $: dissolveBonus = dissolveDelayMultiplier(neuron.dissolveDelaySeconds);

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getDissolvingTimeInSeconds(neuron);

  let spawningTime: bigint | undefined;
  $: spawningTime = getSpawningTimeInSeconds(neuron);

  let stateTextMapper: Record<NeuronState, string>;
  $: stateTextMapper = {
    [NeuronState.Dissolved]: $i18n.neuron_detail.dissolve_delay_row_title,
    [NeuronState.Dissolving]: $i18n.neuron_detail.remaining_title,
    [NeuronState.Spawning]: $i18n.neuron_detail.remaining_title,
    [NeuronState.Locked]: $i18n.neuron_detail.dissolve_delay_row_title,
    [NeuronState.Unspecified]: $i18n.neuron_detail.unspecified,
  };

  let remainingTimeSeconds: bigint;
  $: remainingTimeSeconds =
    dissolvingTime ?? spawningTime ?? neuron.dissolveDelaySeconds;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });

  let duration: string;
  $: duration =
    remainingTimeSeconds > 0n
      ? secondsToDuration({ seconds: remainingTimeSeconds, i18n: $i18n.time })
      : "0";

  let tooltipText: string | undefined;
  $: tooltipText =
    remainingTimeSeconds > 0n
      ? replacePlaceholders($i18n.neuron_detail.dissolve_delay_tooltip, {
          $token: ICPToken.symbol,
          $duration: duration,
        })
      : undefined;
</script>

<CommonItemAction
  testId="nns-neuron-dissolve-delay-item-action-component"
  {tooltipText}
  tooltipId="dissolve-delay-info-icon"
>
  <IconClockNoFill slot="icon" />
  <span slot="title" data-tid="dissolve-delay-text"
    >{`${stateTextMapper[neuron.state]} ${duration}`}</span
  >
  <svelte:fragment slot="subtitle">
    {#if Number(remainingTimeSeconds) >= NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE}
      <DissolveDelayBonusText dissolveMultiplier={dissolveBonus} />
    {:else}
      <span data-tid="dissolve-bonus-text">
        {$i18n.neuron_detail.no_dissolve_bonus}
      </span>
    {/if}</svelte:fragment
  >
  {#if isControllable}
    <IncreaseDissolveDelayButton />
  {/if}
</CommonItemAction>
