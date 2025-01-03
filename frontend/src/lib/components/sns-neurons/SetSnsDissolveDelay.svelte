<script lang="ts">
  import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    getSnsLockedTimeInSeconds,
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    getSnsNeuronState,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import type { NeuronState } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";
  import {
    TokenAmountV2,
    fromDefinedNullable,
    isNullish,
  } from "@dfinity/utils";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let token: Token;
  export let delayInSeconds: number;

  let neuronDissolveDelaySeconds: bigint;
  $: neuronDissolveDelaySeconds = getSnsLockedTimeInSeconds(neuron) ?? 0n;

  let snsParameters: SnsNervousSystemParameters | undefined;
  $: snsParameters = $snsParametersStore[rootCanisterId.toText()]?.parameters;

  let neuronStake: TokenAmountV2;
  $: neuronStake = TokenAmountV2.fromUlps({
    amount: getSnsNeuronStake(neuron),
    token,
  });

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  const calculateVotingPower = (delayInSeconds: number) =>
    isNullish(snsParameters)
      ? 0
      : snsNeuronVotingPower({
          newDissolveDelayInSeconds: BigInt(Math.round(delayInSeconds)),
          neuron,
          snsParameters,
        });

  let maxSnsDelayInSeconds: number | undefined;
  $: maxSnsDelayInSeconds = isNullish(snsParameters)
    ? undefined
    : Number(fromDefinedNullable(snsParameters?.max_dissolve_delay_seconds));

  let minSnsDissolveDelaySeconds: number;
  $: minSnsDissolveDelaySeconds = isNullish(snsParameters)
    ? 0
    : Number(
        fromDefinedNullable(
          snsParameters?.neuron_minimum_dissolve_delay_to_vote_seconds
        )
      );

  let minDissolveDelayDescription = "";
  $: minDissolveDelayDescription = isNullish(snsParameters)
    ? ""
    : replacePlaceholders($i18n.sns_neurons.min_dissolve_delay_description, {
        $duration: `${secondsToDissolveDelayDuration(
          BigInt(minSnsDissolveDelaySeconds)
        )}`,
      });
</script>

<SetDissolveDelay
  bind:delayInSeconds
  on:nnsCancel
  on:nnsConfirmDelay
  {neuronState}
  {neuronDissolveDelaySeconds}
  {neuronStake}
  minProjectDelayInSeconds={minSnsDissolveDelaySeconds}
  maxDelayInSeconds={maxSnsDelayInSeconds}
  {calculateVotingPower}
  {minDissolveDelayDescription}
>
  <Hash
    slot="neuron-id"
    id="neuron-id"
    tagName="p"
    testId="neuron-id"
    text={getSnsNeuronIdAsHexString(neuron)}
  />
  <slot name="cancel" slot="cancel" />
  <slot name="confirm" slot="confirm" />
</SetDissolveDelay>
