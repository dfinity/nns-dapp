<script lang="ts">
  import VotingNeuronSelectList from "./VotingNeuronSelectList.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import IneligibleNeuronsCard from "../IneligibleNeuronsCard.svelte";
  import { definedNeuronsStore } from "../../../stores/neurons.store";

  export let proposalInfo: ProposalInfo;
  export let disabled: boolean;

  // TODO(L2-965): remove :global selector and move style to component
</script>

<div class="neurons">
  <VotingNeuronSelectList {proposalInfo} {disabled} />

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
      border-top: 1px solid var(--line);
      width: calc(100% - (4 * var(--padding)));
      transform: translate(50%, 0);
    }

    @include media.min-width(large) {
      max-height: inherit;
      padding: var(--padding) 0;
    }

    :global(div.content-cell-title) {
      margin-top: var(--padding-4x);
    }

    :global(div.content-cell-details) {
      margin-top: 0;
    }
  }
</style>
