<script lang="ts">
  import Dropdown from "../../../../lib/components/ui/Dropdown.svelte";
  import DropdownItem from "../../../../lib/components/ui/DropdownItem.svelte";

  export let options: { label: string; value: string }[];
  export let value: string | undefined = undefined;

  const changeValue = () => {
    value = options[2].value;
  };
</script>

<span on:click={changeValue} data-tid="test" />

<Dropdown selectedValue={value} name="test">
  {#each options as { label, value } (value)}
    <DropdownItem {value}>
      {label}
    </DropdownItem>
  {/each}
</Dropdown>
