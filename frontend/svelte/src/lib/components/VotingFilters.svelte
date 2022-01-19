<script lang="ts">
  import Filter from "./Filter.svelte";
  import FilterModal from "../modals/VotingFilterModal.svelte";
  import {
    Proposals,
    Rewards,
    Topics,
    VotingFilterModalProps,
    VotingFilters,
  } from "../types/voting";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  const openModal = ({
    title,
    filters,
  }: {
    title: string;
    filters: VotingFilters;
  }) =>
    (modalFilters = {
      title,
      allFilters: filters,
      activeFilters: filters,
    });
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

<FilterModal
  filters={modalFilters}
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
