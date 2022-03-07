<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Card from "../../components/ui/Card.svelte";
  import { NeuronInfo } from "@dfinity/nns";
  import { getNeuron } from "../../services/neurons.services";
  import Spinner from "../../components/ui/Spinner.svelte";
  import NeuronCard from "../../components/neurons/NeuronCard.svelte";

  export let proposalInfo: ProposalInfo;

  let proposer: NeuronId | undefined;
  let neuron: NeuronInfo | undefined;
  let visible: boolean = false;

  const initNeuron = async () => {
    if (!visible || !proposer) {
      neuron = undefined;
      return;
    }

    // TODO: catch error
    neuron = await getNeuron(proposer);
  };

  $: ({ proposer } = proposalInfo);
  $: visible, proposer, (async () => initNeuron())();
</script>

<button class="text" on:click|stopPropagation={() => (visible = true)}
  ><small>Proposer: {proposer || ""}</small></button
>

<Modal {visible} on:nnsClose={() => (visible = false)} theme="dark">
  <span slot="title">{$i18n.neuron_detail.title}</span>

  <!-- TODO: Both neuron details card and fetching neuron itself are implemented in L2-313 -->
  <!-- Above task needs to be solved first before being able to implement following TODOs -->

  {#if neuron !== undefined}
    <div class="content">
      <NeuronCard {neuron} />

      <Card><h4>TODO: Voting history</h4></Card>
    </div>
  {:else}
    <Spinner />
  {/if}
</Modal>

<style lang="scss">
  button {
    padding: 0;
    margin: 0;
  }

  .content {
    padding: calc(2 * var(--padding));
  }
</style>
