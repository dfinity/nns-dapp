<script lang="ts">
  import Filter from "./Filter.svelte";
  import {
    Proposals,
    Rewards,
    Topics,
    VotingFilterModalProps,
  } from "../types/voting";
  import VotingFilterModal from "../modals/VotingFilterModal.svelte";
  import Checkbox from "./Checkbox.svelte";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: VotingFilterModalProps) =>
    (modalFilters = filters);

  // TODO(#L2-206): hideProposals and filters store
</script>

<Filter
  filters={Object.values(Topics)}
  on:filter={() => openModal({ title: "Topics", filters: Topics })}
  >Topics</Filter
>

<div class="status">
  <Filter
    filters={Object.values(Rewards)}
    on:filter={() => openModal({ title: "Rewards Status", filters: Rewards })}
    >Reward Status</Filter
  >

  <Filter
    filters={Object.values(Proposals)}
    on:filter={() =>
      openModal({ title: "Proposals Status", filters: Proposals })}
    >Proposal Status</Filter
  >
</div>

<Checkbox
  inputId="hide-my-proposals"
  checked={false}
  color="dark"
  text="block"
  selector="hide-my-proposals"
  >Hide "Open" proposals where all your neurons have voted or are ineligible to
  vote</Checkbox
>

<VotingFilterModal
  props={modalFilters}
  on:close={() => (modalFilters = undefined)}
/>

<style lang="scss">
  .status {
    display: grid;
    width: calc(100% - var(--padding));
    grid-template-columns: repeat(2, 50%);
    grid-column-gap: var(--padding);

    @media (max-width: 768px) {
      display: block;
      width: 100%;
    }
  }

  :global(div.hide-my-proposals) {
    --select-font-size: var(--font-size-small);
  }
</style>
