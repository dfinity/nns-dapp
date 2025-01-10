<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    dissolveDelayMultiplier,
    getSnsDissolveDelaySeconds,
    getSnsNeuronState,
    hasPermissionToDissolve,
  } from "$lib/utils/sns-neuron.utils";
  import { IconClockNoFill } from "@dfinity/gix-components";
  import { NeuronState } from "@dfinity/nns";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { fromNullable, secondsToDuration, type Token } from "@dfinity/utils";
  import DissolveDelayBonusText from "$lib/components/neuron-detail/DissolveDelayBonusText.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import IncreaseSnsDissolveDelayButton from "$lib/components/sns-neuron-detail/actions/IncreaseSnsDissolveDelayButton.svelte";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let token: Token;

  let state: NeuronState;
  $: state = getSnsNeuronState(neuron);

  let dissolveMultiplier: number;
  $: dissolveMultiplier = dissolveDelayMultiplier({
    neuron,
    snsParameters: parameters,
  });

  let dissolvingTime: bigint;
  $: dissolvingTime = getSnsDissolveDelaySeconds(neuron) ?? 0n;

  let stateTextMapper: Record<NeuronState, string>;
  $: stateTextMapper = {
    [NeuronState.Dissolved]: $i18n.neuron_detail.dissolve_delay_row_title,
    [NeuronState.Dissolving]: $i18n.neuron_detail.remaining_title,
    [NeuronState.Spawning]: $i18n.neuron_detail.remaining_title,
    [NeuronState.Locked]: $i18n.neuron_detail.dissolve_delay_row_title,
    [NeuronState.Unspecified]: $i18n.neuron_detail.unspecified,
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

  let duration: string;
  $: duration =
    dissolvingTime > 0n
      ? secondsToDuration({ seconds: dissolvingTime, i18n: $i18n.time })
      : "0";

  let tooltipText: string | undefined;
  $: tooltipText =
    dissolvingTime > 0n
      ? replacePlaceholders($i18n.neuron_detail.dissolve_delay_tooltip, {
          $token: token.symbol,
          $duration: duration,
        })
      : undefined;
</script>

<CommonItemAction
  testId="sns-neuron-dissolve-delay-item-action-component"
  {tooltipText}
  tooltipId="sns-dissolve-delay-info-icon"
>
  <IconClockNoFill slot="icon" />
  <span slot="title" data-tid="dissolve-delay-text"
    >{`${stateTextMapper[state]} ${duration}`}</span
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
    <IncreaseSnsDissolveDelayButton {neuron} />
  {/if}
</CommonItemAction>
