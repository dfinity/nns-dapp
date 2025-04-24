<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import type { Filter, FiltersData } from "$lib/types/filters";

  type Props = {
    title: string;
    visible: boolean;
    filters: Filter<FiltersData>[] | undefined;
  };

  const { title, visible = true, filters }: Props = $props();
</script>

<FilterModal
  on:nnsClose
  on:nnsConfirm
  on:nnsChange
  on:nnsSelectAll
  on:nnsClearSelection
  {filters}
  {visible}><span slot="title">{title}</span></FilterModal
>
