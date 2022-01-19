<script lang="ts">
  import Filter from "./Filter.svelte";
  import {
    Proposals,
    Rewards,
    Topics,
    VotingFilterModalProps,
    VotingFilters,
  } from "../types/voting";
  import VotingFilterModal from "../modals/VotingFilterModal.svelte";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  const openModal = (filters: { title: string; filters: VotingFilters }) =>
    (modalFilters = filters);
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
    }
  }
</style>
