<script lang="ts">
  import type { NeuronState, Token } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isNullish } from "@dfinity/utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    getSnsLockedTimeInSeconds,
    getSnsNeuronStake,
    getSnsNeuronState,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import type { Principal } from "@dfinity/principal";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { TokenAmount } from "@dfinity/utils";
  import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import Hash from "$lib/components/ui/Hash.svelte";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let token: Token;
  export let delayInSeconds: number;

  let neuronDissolveDelaySeconds: bigint;
  $: neuronDissolveDelaySeconds = getSnsLockedTimeInSeconds(neuron) ?? 0n;

  let snsParameters: SnsNervousSystemParameters | undefined;
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
      ? 0
      : snsNeuronVotingPower({
          newDissolveDelayInSeconds: BigInt(delayInSeconds),
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
    : replacePlaceholders($i18n.sns_neurons.dissolve_delay_description, {
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
  minDelayInSeconds={Number(neuronDissolveDelaySeconds)}
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
