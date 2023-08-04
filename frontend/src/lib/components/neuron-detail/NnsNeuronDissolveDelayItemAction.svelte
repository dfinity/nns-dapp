<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    dissolveDelayMultiplier,
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import IncreaseDissolveDelayButton from "./actions/IncreaseDissolveDelayButton.svelte";
  import { keyOf } from "$lib/utils/utils";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import DissolveDelayBonusText from "./DissolveDelayBonusText.svelte";

  export let neuron: NeuronInfo;

  let dissolveBonus: number;
  $: dissolveBonus = dissolveDelayMultiplier(neuron.dissolveDelaySeconds);

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getDissolvingTimeInSeconds(neuron);

  let spawningTime: bigint | undefined;
  $: spawningTime = getSpawningTimeInSeconds(neuron);

  const stateTextMapper = {
    [NeuronState.Dissolved]: "dissolve_delay_row_title",
    [NeuronState.Dissolving]: "remaining_title",
    [NeuronState.Spawning]: "remaining_title",
    [NeuronState.Locked]: "dissolve_delay_row_title",
    [NeuronState.Unspecified]: "unspecified",
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
</script>

<CommonItemAction testId="nns-neuron-dissolve-delay-item-action-component">
  <IconClockNoFill slot="icon" />
  <span slot="title" data-tid="dissolve-delay-text"
    >{`${keyOf({
      obj: $i18n.neuron_detail,
      key: stateTextMapper[neuron.state],
    })} ${
      remainingTimeSeconds > 0n ? secondsToDuration(remainingTimeSeconds) : "0"
    }`}</span
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
    <IncreaseDissolveDelayButton variant="secondary" />
  {/if}
</CommonItemAction>
