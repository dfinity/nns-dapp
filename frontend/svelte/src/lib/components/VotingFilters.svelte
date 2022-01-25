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
  import { i18n } from "../stores/i18n";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: VotingFilterModalProps) =>
    (modalFilters = filters);

  // TODO(#L2-206): hideProposals and filters store
</script>

<Filter
  filters={Object.values(Topics)}
  key="topics"
  on:nnsFilter={() => openModal({ key: "topics", filters: Topics })}
  >{$i18n.voting.topics}</Filter
>

<div class="status">
  <Filter
    filters={Object.values(Rewards)}
    key="rewards"
    on:nnsFilter={() => openModal({ key: "rewards", filters: Rewards })}
    >{$i18n.voting.rewards}</Filter
  >

  <Filter
    filters={Object.values(Proposals)}
    key="proposals"
    on:nnsFilter={() => openModal({ key: "proposals", filters: Proposals })}
    >{$i18n.voting.proposals}</Filter
  >
</div>

<Checkbox
  inputId="hide-unavailable-proposals"
  checked={false}
  color="dark"
  text="block"
  selector="hide-unavailable-proposals"
  >{$i18n.voting.hide_unavailable_proposals}</Checkbox
>

<VotingFilterModal
  props={modalFilters}
  on:nnsClose={() => (modalFilters = undefined)}
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

  :global(div.hide-unavailable-proposals) {
    --select-font-size: var(--font-size-small);
  }
</style>
