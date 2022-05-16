<script lang="ts">
  import Input from "../../../../lib/components/ui/Input.svelte";

  export let inputType: "text";
  export let name: string;
  export let placeholderLabelKey: string;

  let amount: string;

  // We want to test that we can change value programtically
  const changeValue = () => {
    amount = "new value";
  };
</script>

<span on:click={changeValue} id="test" />

<Input bind:value={amount} {inputType} {name} {placeholderLabelKey} />
