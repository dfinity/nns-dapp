<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { CardType } from "../../types/card";
  import type { StateInfo } from "../../utils/neuron.utils";
  import {
    getSnsDissolvingTimeInSeconds,
    getSnsLockedTimeInSeconds,
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    getSnsNeuronState,
    getSnsStateInfo,
  } from "../../utils/sns-neuron.utils";
  import IcpComponent from "../ic/ICP.svelte";
  import NeuronCardContainer from "../neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "../neurons/NeuronStateInfo.svelte";
  import NeuronStateRemainingTime from "../neurons/NeuronStateRemainingTime.svelte";

  export let neuron: SnsNeuron;
  export let role: "link" | undefined = undefined;
  export let cardType: CardType = "card";
  export let ariaLabel: string | undefined = undefined;

  let neuronId: string;
  $: neuronId = getSnsNeuronIdAsHexString(neuron);

  let neuronICP: ICP;
  $: neuronICP = ICP.fromE8s(getSnsNeuronStake(neuron));

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getSnsStateInfo(neuron);

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getSnsDissolvingTimeInSeconds(neuron);

  let lockedTime: bigint | undefined;
  $: lockedTime = getSnsLockedTimeInSeconds(neuron);
</script>

<NeuronCardContainer on:click {role} {cardType} {ariaLabel}>
  <div slot="start" data-tid="sns-neuron-card-title">
    <h3 data-tid="neuron-id">{neuronId}</h3>
    <!-- TODO: Hotkey label https://dfinity.atlassian.net/browse/L2-899 -->
  </div>

  <div slot="end" class="currency">
    <IcpComponent icp={neuronICP} detailed />
  </div>

  <NeuronStateInfo {stateInfo} />

  <NeuronStateRemainingTime
    state={getSnsNeuronState(neuron)}
    timeInSeconds={dissolvingTime ?? lockedTime}
  />

  <slot />
</NeuronCardContainer>

<style lang="scss">
  @use "../../themes/mixins/media";

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    margin-bottom: var(--padding);

    @include media.min-width(medium) {
      margin-bottom: 0;
    }
  }
</style>
