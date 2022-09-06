<script lang="ts">
    import VotingNeuronSelectList from "./VotingNeuronSelectList.svelte";
    import type {ProposalInfo} from '@dfinity/nns';
    import IneligibleNeuronsCard from "../IneligibleNeuronsCard.svelte";
    import {definedNeuronsStore} from "../../../stores/neurons.store";

    export let proposalInfo: ProposalInfo;
    export let disabled: boolean;
</script>

<div class="neurons">
    <VotingNeuronSelectList {proposalInfo} {disabled} />

    <IneligibleNeuronsCard {proposalInfo} neurons={$definedNeuronsStore} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .neurons {
    border-top: 1px solid var(--line);
    padding-top: var(--padding-0_5x);
    max-height: 30vh;
    overflow-y: auto;

    @include media.min-width(large) {
      max-height: inherit;
    }
  }
</style>
