<script lang="ts">
  import Filter from "./Filter.svelte";
  import { Topics } from "../constants/topics";
  import { Rewards } from "../constants/rewards";
  import { Proposals } from "../constants/proposals";
  import FilterModal from "../modals/FilterModal.svelte";

  let modalFilters:
    | { title: string; allFilters: string[]; activeFilters: string[] }
    | undefined = undefined;

  const openModal = ({
    title,
    filters,
  }: {
    title: string;
    filters: Topics | Rewards | Proposals;
  }) =>
    (modalFilters = {
      title,
      allFilters: Object.values(filters),
      activeFilters: [],
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
