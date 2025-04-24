<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";
  import type { Filter, FiltersData } from "$lib/types/filters";

  type Props = {
    title: string;
    visible: boolean;
    filters: Filter<FiltersData>[] | undefined;
  };

  const defaultFilters = [
    {
      id: "1",
      value: 1,
      name: "Filter 1",
      checked: false,
    },
    {
      id: "2",
      value: 2,
      name: "Filter 2",
      checked: true,
    },
  ];

  const { title, visible = true, filters = defaultFilters }: Props = $props();
</script>

<FilterModal on:nnsClose on:nnsConfirm {filters} {visible}
  ><span slot="title">{title}</span></FilterModal
>
