<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import { selectedNeuronsVotingPower } from "../../../utils/proposals.utils";
  import { formatVotingPower } from "../../../utils/neuron.utils";
  import Checkbox from "../../ui/Checkbox.svelte";

  let total: bigint;

  $: total = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });

  const toggleSelection = (neuronId: bigint) =>
    votingNeuronSelectStore.toggleSelection(neuronId);
</script>

<p class="headline">
  <span>{$i18n.proposal_detail__vote.neurons}</span>
  <span>{$i18n.proposal_detail__vote.voting_power}</span>
</p>

<ul>
  {#each $votingNeuronSelectStore.neurons as { neuronId, votingPower }}
    <li>
      <Checkbox
        inputId={`${neuronId}`}
        checked={$votingNeuronSelectStore.selectedIds.includes(neuronId)}
        on:nnsChange={() => toggleSelection(neuronId)}
        theme="dark"
        text="block"
        selector="neuron-checkbox"
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
  <span>{$i18n.proposal_detail__vote.total}</span>
  {formatVotingPower(total === undefined ? 0n : total)}
</p>

<style lang="scss">
  @use "../../../themes/mixins/media";

  .headline {
    padding: var(--padding-0_5x) var(--padding) var(--padding-0_5x)
      calc(4.25 * var(--padding));
    display: flex;
    justify-content: space-between;

    font-size: var(--font-size-h4);
    color: var(--gray-200);
    background: var(--gray-100-background);

    // hide voting-power-headline because of the layout
    :last-child {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;

    // checkbox restyling
    :global(.neuron-checkbox) {
      padding: var(--padding);
    }
    :global(input[type="checkbox"]) {
      margin-left: 0;
    }
    :global(label) {
      margin-left: var(--padding-0_5x);

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
</style>
