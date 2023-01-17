<script lang="ts">
  import type { NeuronState, Token } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isNullish } from "$lib/utils/utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    getSnsLockedTimeInSeconds,
    getSnsNeuronStake,
    getSnsNeuronState,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import type { NervousSystemParameters } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import type { Principal } from "@dfinity/principal";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { TokenAmount } from "@dfinity/nns";
  import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let token: Token;
  export let delayInSeconds: number;
  export let cancelButtonText: string;
  export let confirmButtonText: string;

  let neuronDissolveDelaySeconds: bigint;
  $: neuronDissolveDelaySeconds = getSnsLockedTimeInSeconds(neuron) ?? 0n;

  let snsParameters: NervousSystemParameters | undefined;
  $: snsParameters = $snsParametersStore[rootCanisterId.toText()]?.parameters;

  let neuronStake: TokenAmount;
  $: neuronStake = TokenAmount.fromE8s({
    amount: getSnsNeuronStake(neuron),
    token,
  });

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  const calculateVotingPower = (delayInSeconds: number) =>
    isNullish(snsParameters)
      ? 0n
      : snsNeuronVotingPower({
          newDissolveDelayInSeconds: BigInt(delayInSeconds),
          neuron,
          snsParameters,
        });
  let maxSnsDelayInSeconds: number | undefined;
  $: maxSnsDelayInSeconds = isNullish(snsParameters)
    ? undefined
    : Number(fromDefinedNullable(snsParameters?.max_dissolve_delay_seconds));

  let minSnsDissolveDelaySeconds: number | undefined;
  $: minSnsDissolveDelaySeconds = isNullish(snsParameters)
    ? undefined
    : Number(
        fromDefinedNullable(
          snsParameters?.neuron_minimum_dissolve_delay_to_vote_seconds
        )
      );

  let minDissolveDelayDescription = "";
  $: minDissolveDelayDescription = isNullish(snsParameters)
    ? ""
    : replacePlaceholders($i18n.sns_neurons.dissolve_delay_description, {
        $duration: secondsToDissolveDelayDuration(
          BigInt(minSnsDissolveDelaySeconds)
        ),
      });
</script>

<SetDissolveDelay
  bind:delayInSeconds
  on:nnsCancel
  on:nnsConfirmDelay
  neuronIdText={getSnsNeuronIdAsHexString(neuron)}
  {neuronState}
  {neuronDissolveDelaySeconds}
  {neuronStake}
  minProjectDelayInSeconds={minSnsDissolveDelaySeconds}
  minDelayInSeconds={Number(neuronDissolveDelaySeconds)}
  maxDelayInSeconds={maxSnsDelayInSeconds}
  {cancelButtonText}
  {confirmButtonText}
  {calculateVotingPower}
  minDissolveDelayDescription={$i18n.neurons.dissolve_delay_description}
/>
