<script lang="ts">
  import FiltersCard from "../ui/FiltersCard.svelte";
  import {
    Proposals,
    Rewards,
    Topics,
    VotingFilterModalProps,
  } from "../../types/voting";
  import VotingFilterModal from "../../modals/VotingFilterModal.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import { i18n } from "../../stores/i18n";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: VotingFilterModalProps) =>
    (modalFilters = filters);

  // TODO(#L2-206): hideProposals and filters store
</script>

<FiltersCard
  filters={Object.values(Topics)}
  key="topics"
  on:nnsFilter={() => openModal({ labelKey: "topics", filters: Topics })}
  >{$i18n.voting.topics}</FiltersCard
>

<div class="status">
  <FiltersCard
    filters={Object.values(Rewards)}
    key="rewards"
    on:nnsFilter={() => openModal({ labelKey: "rewards", filters: Rewards })}
    >{$i18n.voting.rewards}</FiltersCard
  >

  <FiltersCard
    filters={Object.values(Proposals)}
    key="proposals"
    on:nnsFilter={() =>
      openModal({ labelKey: "proposals", filters: Proposals })}
    >{$i18n.voting.proposals}</FiltersCard
  >
</div>

<Checkbox
  inputId="hide-unavailable-proposals"
  checked={false}
  theme="dark"
  text="block"
  selector="hide-unavailable-proposals"
  >{$i18n.voting.hide_unavailable_proposals}</Checkbox
>

<VotingFilterModal
  props={modalFilters}
  on:nnsClose={() => (modalFilters = undefined)}
/>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  .status {
    display: block;
    width: 100%;

    @include media.min-width(medium) {
      display: grid;
      width: calc(100% - var(--padding));
      grid-template-columns: repeat(2, 50%);
      grid-column-gap: var(--padding);
    }
  }

  :global(div.hide-unavailable-proposals) {
    --select-font-size: var(--font-size-small);
  }
</style>
