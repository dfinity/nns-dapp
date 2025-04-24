<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import type {
    Filter,
    FiltersData,
    NnsProposalFilterCategory,
  } from "$lib/types/filters";

  type Props = {
    title: string;
    visible: boolean;
    filters: Filter<FiltersData>[] | undefined;
    category: undefined | NnsProposalFilterCategory;
  };

  const { title, visible = true, filters, category }: Props = $props();
</script>

<FilterModal
  on:nnsClose
  on:nnsConfirm
  on:nnsChange
  on:nnsSelectAll
  on:nnsClearSelection
  {filters}
  {visible}
  {category}><span slot="title">{title}</span></FilterModal
>
