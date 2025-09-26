<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsFiltersStore } from "$lib/stores/sns-filters.store";
  import type { Filter } from "$lib/types/filters";
  import type { Principal } from "@icp-sdk/core/principal";
  import type { SnsProposalDecisionStatus } from "@dfinity/sns";

  type Props = {
    rootCanisterId: Principal;
    filters: Filter<SnsProposalDecisionStatus>[] | undefined;
    closeModal: () => void;
  };
  const { rootCanisterId, filters = [], closeModal }: Props = $props();

  // This is a temporary value to be used inside the modal. It's initialized based on the prop filters;
  let selectedFilters = $derived<SnsProposalDecisionStatus[]>(
    filters.filter(({ checked }) => checked).map(({ value }) => value)
  );

  // This is a temporary value to be used inside the modal
  let filtersValues = $derived<Filter<SnsProposalDecisionStatus>[]>(
    filters.map((filter) => ({
      ...filter,
      checked: selectedFilters.includes(filter.value),
    }))
  );

  let filter = $derived(() => {
    snsFiltersStore.setCheckDecisionStatus({
      checkedDecisionStatus: selectedFilters,
      rootCanisterId,
    });
    closeModal();
  });

  const onChange = ({
    detail: { filter },
  }: CustomEvent<{
    filter: Filter<SnsProposalDecisionStatus> | undefined;
  }>) => {
    if (filter === undefined) {
      return;
    }
    selectedFilters = [
      ...selectedFilters.filter((status) => status !== filter?.value),
      // Toggle the checked value
      ...(filter.checked ? [] : [filter.value]),
    ];
  };

  const clear = () => (selectedFilters = []);
  const selectAll = () => (selectedFilters = filters.map(({ value }) => value));
</script>

<FilterModal
  on:nnsClose={closeModal}
  on:nnsConfirm={filter}
  on:nnsChange={onChange}
  on:nnsSelectAll={selectAll}
  on:nnsClearSelection={clear}
  filters={filtersValues}
>
  <span slot="title">{$i18n.voting.status}</span>
</FilterModal>
