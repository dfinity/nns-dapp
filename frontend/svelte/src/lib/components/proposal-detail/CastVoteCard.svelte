<script lang="ts">
  import { NeuronInfo, ProposalInfo, ProposalStatus } from "@dfinity/nns";
  import { formatVotingPower } from "../../utils/proposals.utils";
  import Card from "../ui/Card.svelte";
  import Checkbox from "../ui/Checkbox.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[] | undefined;

  let visible: boolean = false;
  let notVotedNeurons: NeuronInfo[] | undefined;
  // TODO: convert to Set?
  let selectedNeuronIds: Set<bigint> | undefined;
  let votingPowerSelected: bigint | undefined;
  // TODO: use util filter
  $: notVotedNeurons = neurons; /*notVotedNeurons({
    neurons,
    proposal: proposalInfo,
  });*/
  $: visible =
    notVotedNeurons?.length &&
    proposalInfo.status === ProposalStatus.PROPOSAL_STATUS_OPEN;
  // select all neurons by default
  $: if (!selectedNeuronIds && notVotedNeurons?.length)
    selectedNeuronIds = new Set(
      notVotedNeurons.map(({ neuronId }) => neuronId)
    );
  // TODO: check selection?
  $: votingPowerSelected = notVotedNeurons
    ? notVotedNeurons
        .filter(({ neuronId }) => selectedNeuronIds.has(neuronId))
        .reduce((sum, { votingPower }) => sum + votingPower, 0n)
    : 0n;

  $: console.log("selectedNeuronIds", selectedNeuronIds);

  const adopt = () => {
    console.log("adopt");
  };
  const reject = () => {
    console.log("reject");
  };
  const toggleNeuron = (neuronId: bigint) => {
    if (selectedNeuronIds.has(neuronId)) {
      selectedNeuronIds.delete(neuronId);
    } else {
      selectedNeuronIds.add(neuronId);
    }
    selectedNeuronIds = selectedNeuronIds;
  };
</script>

{#if visible}
  <Card>
    <h3 slot="start">Cast Vote</h3>
    <div class="neurons-headline">
      <span>neurons</span> <span>voting power</span>
    </div>
    <!-- ...widget.neurons.map((n)  -->
    <!-- 'You are about to cast $numVotes votes against this proposal, are you sure you want to proceed? ' -->
    {#each notVotedNeurons as { neuronId, votingPower }}
      <Checkbox
        inputId={`${neuronId}`}
        checked={selectedNeuronIds.has(neuronId)}
        on:nnsChange={() => toggleNeuron(neuronId)}
        theme="dark"
        text="block"
        selector="hide-unavailable-proposals"
        inputFirst
      >
        <div class="neuron-label">
          <div>{`${neuronId}`}</div>
          <div>{`${formatVotingPower(votingPower)}`}</div>
        </div>
      </Checkbox>
    {/each}
    <div class="neurons-total">
      total: {formatVotingPower(votingPowerSelected)}
    </div>

    <div class="buttons">
      <button on:click={adopt} class="primary full-width">Adopt</button>
      <button on:click={reject} class="danger full-width">Reject</button>
    </div>
  </Card>
{/if}

<style lang="scss">
  .neurons-headline {
    display: flex;
    justify-content: space-between;
    margin-left: calc(2 * var(--padding));
  }

  .neurons-total {
    text-align: right;
  }
  .neuron-label {
    display: flex;
    justify-content: space-between;
    margin-left: var(--padding);
  }
  .buttons {
    display: flex;
    gap: var(--padding);
  }
</style>
