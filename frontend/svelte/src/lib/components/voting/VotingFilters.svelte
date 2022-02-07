<script lang="ts">
  import FiltersCard from "../ui/FiltersCard.svelte";
  import { VotingFilterModalProps } from "../../types/voting";
  import VotingFilterModal from "../../modals/VotingFilterModal.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import { i18n } from "../../stores/i18n";
  import { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";
  import { enumKeys } from "../../utils/enum.utils";

  let modalFilters: VotingFilterModalProps | undefined = undefined;

  // The voting modal is displayed when filters are set i.e. when filters have to be selected
  const openModal = (filters: VotingFilterModalProps) =>
    (modalFilters = filters);

  // TODO(#L2-206): hideProposals and filters store
</script>

<!-- TODO: should we use unspecified and manageneuron -->

<FiltersCard
  filters={enumKeys(Topic)}
  key="topics"
  on:nnsFilter={() => openModal({ labelKey: "topics", filters: Topic })}
  >{$i18n.voting.topics}</FiltersCard
>

<div class="status">
  <!-- TODO: Do we want unknown? -->

  <FiltersCard
    filters={enumKeys(ProposalRewardStatus)}
    key="rewards"
    on:nnsFilter={() =>
      openModal({ labelKey: "rewards", filters: ProposalRewardStatus })}
    >{$i18n.voting.rewards}</FiltersCard
  >

  <!-- TODO: Do we want unknown? -->

  <FiltersCard
    filters={enumKeys(ProposalStatus)}
    key="proposals"
    on:nnsFilter={() =>
      openModal({ labelKey: "proposals", filters: ProposalStatus })}
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
