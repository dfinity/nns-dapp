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
  import Radio from "./Radio.svelte";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  const openModal = (filters: { title: string; filters: VotingFilters }) =>
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

<Radio
  name="hideProposals"
  value={'Hide "Open" proposals where all your neurons have voted or are ineligible to vote'}
  checked={false}
/>

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
</style>
