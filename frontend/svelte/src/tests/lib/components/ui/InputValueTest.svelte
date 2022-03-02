<script lang="ts">
  import Input from "../../../../lib/components/ui/Input.svelte";

  export let props = {};

  let amount: string;

  // We want to test that we can change value programtically
  const changeValue = () => {
    amount = "new value";
  };
</script>

<span on:click={changeValue} id="test" />

<Input bind:value={amount} {...props} />
