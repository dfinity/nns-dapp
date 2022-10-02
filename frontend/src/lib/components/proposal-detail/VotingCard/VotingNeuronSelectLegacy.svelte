<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import { formatVotingPower } from "../../../utils/neuron.utils";
  import Value from "../../ui/Value.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import VotingNeuronSelectList from "./VotingNeuronSelectList.svelte";

  export let proposalInfo: ProposalInfo;
  export let disabled: boolean;
  export let totalNeuronsVotingPower: bigint;
</script>

<p class="headline">
  <span>{$i18n.proposal_detail__vote.neurons}</span>
  <span>{$i18n.proposal_detail__vote.voting_power}</span>
</p>

<VotingNeuronSelectList {proposalInfo} {disabled} />

<p class="total">
  <span>{$i18n.proposal_detail__vote.total}</span>
  <Value
    >{formatVotingPower(
      totalNeuronsVotingPower === undefined ? 0n : totalNeuronsVotingPower
    )}</Value
  >
</p>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .headline {
    padding: var(--padding-0_5x) var(--padding) var(--padding-0_5x)
      calc(4.25 * var(--padding));
    display: flex;
    justify-content: space-between;

    border-bottom: 1px solid var(--line);

    // hide voting-power-headline because of the layout
    :last-child {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }
  }

  .total {
    margin-top: var(--padding);
    padding: var(--padding);

    display: flex;
    align-items: center;
    justify-content: end;

    border-top: 1px solid var(--line);

    text-align: right;

    span {
      margin-right: var(--padding);
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }
</style>
