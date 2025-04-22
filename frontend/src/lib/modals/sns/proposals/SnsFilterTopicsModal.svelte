<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsFiltersStore } from "$lib/stores/sns-filters.store";
  import type { Filter, SnsProposalTopicFilterId } from "$lib/types/filters";
  import type { Principal } from "@dfinity/principal";

  type Props = {
    rootCanisterId: Principal;
    filters: Filter<SnsProposalTopicFilterId>[] | undefined;
    closeModal: () => void;
  };

  const { rootCanisterId, filters = [], closeModal }: Props = $props();

  const filtersValues = $derived<Filter<SnsProposalTopicFilterId>[]>(
    filters.map((filter) => ({
      ...filter,
      checked: selectedFilters.includes(filter.value),
    }))
  );
  let selectedFilters = $derived<SnsProposalTopicFilterId[]>(
    filters.filter((item) => item.checked).map(({ value }) => value)
  );

  let selectedFilters = $derived<Array<SnsProposalTopicFilterId>>(
    filters.filter((item) => item.checked).map(({ value }) => value)
  );

  const filter = () => {
    snsFiltersStore.setCheckTopics({
      checkedTopics: selectedFilters,
      rootCanisterId,
    });
    closeModal();
  };

  const onChange = ({
    detail: { filter },
  }: CustomEvent<{
    filter: Filter<SnsProposalTopicFilterId> | undefined;
  }>) => {
    if (filter === undefined) return;
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
  category="topics"
>
  <span slot="title">{$i18n.voting.topics}</span>
</FilterModal>
