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

<!-- 'You are about to cast $numVotes votes against this proposal, are you sure you want to proceed? ' -->
{#if visible}
  <Card>
    <h3 slot="start">Cast Vote</h3>

    <p class="headline">
      <span>neurons</span>
      <span>voting power</span>
    </p>

    <ul>
      {#each notVotedNeurons as { neuronId, votingPower }}
        <li>
          <Checkbox
            inputId={`${neuronId}`}
            checked={selectedNeuronIds.has(neuronId)}
            on:nnsChange={() => toggleNeuron(neuronId)}
            theme="dark"
            text="block"
            selector="hide-unavailable-proposals"
            inputFirst
          >
            <span class="neuron-id">{`${neuronId}`}</span>
            <span class="neuron-voting-power"
              >{`${formatVotingPower(votingPower)}`}</span
            >
          </Checkbox>
        </li>
      {/each}
    </ul>

    <p class="total">
      <span>total</span>
      {formatVotingPower(votingPowerSelected)}
    </p>

    <div role="toolbar" class="buttons">
      <button
        disabled={!votingPowerSelected}
        on:click={adopt}
        class="primary full-width">Adopt</button
      >
      <button
        disabled={!votingPowerSelected}
        on:click={reject}
        class="danger full-width">Reject</button
      >
    </div>
  </Card>
{/if}

<style lang="scss">
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/text";

  .headline {
    padding: calc(0.5 * var(--padding)) var(--padding)
      calc(0.5 * var(--padding)) calc(4.25 * var(--padding));
    display: flex;
    justify-content: space-between;

    font-size: var(--font-size-h4);
    color: var(--gray-200);
    background: var(--gray-100-background);

    // hide voting-power-headline because of the layout
    :last-child {
      visibility: hidden;

      @include media.min-width(small) {
        visibility: visible;
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;

    // checkbox restyling
    :global(.checkbox.dark) {
      padding: var(--padding);
    }

    :global(input[type="checkbox"]) {
      margin-left: 0;
    }

    :global(label) {
      margin-left: calc(0.5 * var(--padding));

      display: flex;
      flex-direction: column;
      justify-content: space-between;

      order: 1;

      @include media.min-width(small) {
        flex-direction: row;
        align-items: center;
      }
    }

    .neuron-id {
      font-size: var(--font-size-h5);

      @include media.min-width(medium) {
        font-size: var(--font-size-h4);
      }
    }
    .neuron-voting-power {
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }

  .total {
    margin-top: var(--padding);
    padding: var(--padding);

    display: flex;
    align-items: center;
    justify-content: end;

    border-top: 1px solid currentColor;

    color: var(--gray-200);
    text-align: right;
    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h4);
    }

    span {
      margin-right: var(--padding);
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }

  .buttons {
    margin-top: var(--padding);

    display: flex;
    gap: var(--padding);
  }
</style>
