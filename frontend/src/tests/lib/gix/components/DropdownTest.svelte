<script lang="ts">
  import Dropdown from "$lib/gix/components/Dropdown.svelte";
  import DropdownItem from "$lib/gix/components/DropdownItem.svelte";

  export let options: { label: string; value: string }[];
  export let value: string | undefined = undefined;

  const changeValue = () => {
    value = options[2].value;
  };
</script>

<!-- eslint-disable svelte/valid-compile -->
<span data-tid="test" on:click={changeValue} />

<Dropdown name="test" selectedValue={value}>
  {#each options as { label, value } (value)}
    <DropdownItem {value}>
      {label}
    </DropdownItem>
  {/each}
</Dropdown>
