<script lang="ts">
  import VotingNeuronSelectList from "./VotingNeuronSelectList.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import IneligibleNeuronsCard from "../IneligibleNeuronsCard.svelte";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import MyVotes from "../MyVotes.svelte";

  export let proposalInfo: ProposalInfo;
  export let disabled: boolean;
</script>

<div class="neurons">
  <VotingNeuronSelectList {proposalInfo} {disabled} />

  <MyVotes {proposalInfo} />

  <IneligibleNeuronsCard {proposalInfo} neurons={$definedNeuronsStore} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .neurons {
    padding: var(--padding-1_5x) var(--padding) 0;
    max-height: var(--voting-bottom-sheet-content-max-height);
    overflow-y: auto;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      right: 50%;
      border-top: 1px solid var(--tertiary);
      width: calc(100% - (4 * var(--padding)));
      transform: translate(50%, 0);
    }

    @include media.min-width(large) {
      max-height: inherit;
      padding: var(--padding) 0;

      &:before {
        width: 100%;
      }
    }

    :global(div.content-cell-title) {
      margin-top: var(--padding-4x);
    }

    :global(div.content-cell-details) {
      margin-top: 0;
    }
  }
</style>
