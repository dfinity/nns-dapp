<script lang="ts">
  import Dropdown from "../../../../lib/components/ui/Dropdown.svelte";

  const options = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];
  let value: string = options[0].value;

  const changeValue = () => {
    value = options[2].value;
  };
</script>

<span on:click={changeValue} data-tid="test" />

<Dropdown {value} name="test" {options} />
