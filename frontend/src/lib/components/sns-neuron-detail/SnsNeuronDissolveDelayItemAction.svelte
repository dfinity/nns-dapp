<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import { NeuronState } from "@dfinity/nns";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import { keyOf } from "$lib/utils/utils";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    dissolveDelayMultiplier,
    getSnsDissolveDelaySeconds,
    getSnsNeuronState,
    hasPermissionToDissolve,
  } from "$lib/utils/sns-neuron.utils";
  import { fromNullable } from "@dfinity/utils";
  import IncreaseSnsDissolveDelayButton from "./actions/IncreaseSnsDissolveDelayButton.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import DissolveDelayBonusText from "../neuron-detail/DissolveDelayBonusText.svelte";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;

  let state: NeuronState;
  $: state = getSnsNeuronState(neuron);

  let dissolveMultiplier: number;
  $: dissolveMultiplier = dissolveDelayMultiplier({
    neuron,
    snsParameters: parameters,
  });

  let dissolvingTime: bigint;
  $: dissolvingTime = getSnsDissolveDelaySeconds(neuron) ?? 0n;

  const stateTextMapper = {
    [NeuronState.Dissolved]: "dissolve_delay_row_title",
    [NeuronState.Dissolving]: "remaining_title",
    [NeuronState.Spawning]: "remaining_title",
    [NeuronState.Locked]: "dissolve_delay_row_title",
    [NeuronState.Unspecified]: "unspecified",
  };

  let minimumDelayToVoteInSeconds: bigint;
  $: minimumDelayToVoteInSeconds =
    fromNullable(parameters.neuron_minimum_dissolve_delay_to_vote_seconds) ??
    0n;

  let allowedToDissolve = false;
  $: allowedToDissolve = hasPermissionToDissolve({
    neuron,
    identity: $authStore.identity,
  });
</script>

<CommonItemAction testId="sns-neuron-dissolve-delay-item-action-component">
  <IconClockNoFill slot="icon" />
  <span slot="title" data-tid="dissolve-delay-text"
    >{`${keyOf({
      obj: $i18n.neuron_detail,
      key: stateTextMapper[state],
    })} ${dissolvingTime > 0n ? secondsToDuration(dissolvingTime) : "0"}`}</span
  >
  <svelte:fragment slot="subtitle">
    {#if dissolvingTime >= minimumDelayToVoteInSeconds}
      <DissolveDelayBonusText {dissolveMultiplier} />
    {:else}
      <span data-tid="dissolve-bonus-text">
        {$i18n.neuron_detail.no_dissolve_bonus}
      </span>
    {/if}</svelte:fragment
  >
  {#if allowedToDissolve}
    <IncreaseSnsDissolveDelayButton {neuron} variant="secondary" />
  {/if}
</CommonItemAction>
