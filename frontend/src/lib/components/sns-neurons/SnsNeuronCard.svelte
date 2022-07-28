<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { CardType } from "../../types/card";
  import type { StateInfo } from "../../utils/neuron.utils";
  import { getSnsStateInfo } from "../../utils/sns-neuron.utils";
  import IcpComponent from "../ic/ICP.svelte";
  import NeuronCardContainer from "../neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "../neurons/NeuronStateInfo.svelte";

  export let neuron: SnsNeuron;
  export let role: "link";
  export let cardType: CardType = "card";
  export let ariaLabel: string;

  let neuronId: string = "";
  $: neuronId = neuron.id[0]?.id.join("") ?? "";

  let neuronICP: ICP;
  $: neuronICP = ICP.fromE8s(neuron.cached_neuron_stake_e8s);

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getSnsStateInfo(neuron);

  $: {
    console.log("in da snsneuroncard", stateInfo);
  }
</script>

<NeuronCardContainer on:click {role} {cardType} {ariaLabel}>
  <div slot="start" class="lock" data-tid="sns-neuron-card-title">
    <h3 data-tid="neuron-id">{neuronId}</h3>
  </div>

  <div slot="end" class="currency">
    <IcpComponent icp={neuronICP} detailed />
  </div>

  <NeuronStateInfo {stateInfo} />
</NeuronCardContainer>
