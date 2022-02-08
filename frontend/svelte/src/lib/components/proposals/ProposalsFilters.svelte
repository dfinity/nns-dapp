<script lang="ts">
  import FiltersCard from "../ui/FiltersCard.svelte";
  import { ProposalsFilterModalProps } from "../../types/proposals";
  import ProposalsFilterModal from "../../modals/ProposalsFilterModal.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import { i18n } from "../../stores/i18n";
  import { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";
  import { proposalsStore } from "../../stores/proposals.store";
  import { enumsKeys } from "../../utils/enum.utils";

  let modalFilters: ProposalsFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: ProposalsFilterModalProps) =>
    (modalFilters = filters);

  $: ({ filters } = $proposalsStore);
</script>

<!-- TODO: should we use unspecified and manageneuron -->

<FiltersCard
  filters={enumsKeys({ obj: Topic, values: filters.topics })}
  labelKey="topics"
  on:nnsFilter={() =>
    openModal({
      category: "topics",
      filters: Topic,
      selectedFilters: filters.topics,
    })}>{$i18n.voting.topics}</FiltersCard
>

<div class="status">
  <!-- TODO: Do we want unknown? -->

  <FiltersCard
    filters={enumsKeys({ obj: ProposalRewardStatus, values: filters.rewards })}
    labelKey="rewards"
    on:nnsFilter={() =>
      openModal({
        category: "rewards",
        filters: ProposalRewardStatus,
        selectedFilters: filters.rewards,
      })}>{$i18n.voting.rewards}</FiltersCard
  >

  <!-- TODO: Do we want unknown? -->

  <FiltersCard
    filters={enumsKeys({ obj: ProposalStatus, values: filters.status })}
    labelKey="status"
    on:nnsFilter={() =>
      openModal({
        category: "status",
        filters: ProposalStatus,
        selectedFilters: filters.status,
      })}>{$i18n.voting.proposals}</FiltersCard
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

<ProposalsFilterModal
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
