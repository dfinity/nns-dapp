<script lang="ts">
  import FiltersCard from "../ui/FiltersCard.svelte";
  import type { ProposalsFilterModalProps } from "../../types/proposals";
  import ProposalsFilterModal from "../../modals/ProposalsFilterModal.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import { i18n } from "../../stores/i18n";
  import { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import { enumsKeys } from "../../utils/enum.utils";

  let modalFilters: ProposalsFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: ProposalsFilterModalProps) =>
    (modalFilters = filters);

  // TODO(L2-206): Happy to get help here to type the enum.
  // If set to "T" TypeScript throw following error: Type 'typeof Topic' is not assignable to type 'Topic'
  const allTopics: Topic = Topic as unknown as Topic;
  const allRewards: ProposalRewardStatus =
    ProposalRewardStatus as unknown as ProposalRewardStatus;
  const allStatus: ProposalStatus = ProposalStatus as unknown as ProposalStatus;

  let topics: Topic[];
  let rewards: ProposalRewardStatus[];
  let status: ProposalStatus[];
  let excludeVotedProposals: boolean;

  $: ({ topics, rewards, status, excludeVotedProposals } =
    $proposalsFiltersStore);
</script>

<FiltersCard
  filters={enumsKeys({ obj: allTopics, values: topics })}
  labelKey="topics"
  on:nnsFilter={() =>
    openModal({
      category: "topics",
      filters: Topic,
      selectedFilters: topics,
    })}>{$i18n.voting.topics}</FiltersCard
>

<div class="status">
  <FiltersCard
    filters={enumsKeys({ obj: allRewards, values: rewards })}
    labelKey="rewards"
    on:nnsFilter={() =>
      openModal({
        category: "rewards",
        filters: ProposalRewardStatus,
        selectedFilters: rewards,
      })}>{$i18n.voting.rewards}</FiltersCard
  >

  <FiltersCard
    filters={enumsKeys({ obj: allStatus, values: status })}
    labelKey="status"
    on:nnsFilter={() =>
      openModal({
        category: "status",
        filters: ProposalStatus,
        selectedFilters: status,
      })}>{$i18n.voting.status}</FiltersCard
  >
</div>

<Checkbox
  inputId="hide-unavailable-proposals"
  checked={excludeVotedProposals}
  on:nnsChange={() => proposalsFiltersStore.toggleExcludeVotedProposals()}
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

  :global(section > div.checkbox) {
    margin: 0 0 var(--padding);
  }
</style>
