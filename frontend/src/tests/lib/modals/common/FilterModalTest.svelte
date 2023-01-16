<script lang="ts">
  import FilterModal from "$lib/modals/common/FilterModal.svelte";

  export let title: string;

  const filters = [
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
</script>

<FilterModal on:nnsClose on:nnsConfirm {filters}
  ><span slot="title">{title}</span></FilterModal
>
