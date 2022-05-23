<script lang="ts">
  import { createEventDispatcher } from "svelte/internal";

  import Input from "../../../../lib/components/ui/Input.svelte";

  const dispatch = createEventDispatcher();

  export let inputType: "text" | "icp" = "text";
  export let name: string;
  export let value: string | undefined;
  export let placeholderLabelKey: string | undefined;

  let amount: string | undefined = value;
  $: amount, (() => dispatch("testAmount", { amount }))();

  // We want to test that we can change value programtically
  const changeValue = () => {
    amount = "new value";
  };
</script>

<span on:click={changeValue} id="test" />

<Input bind:value={amount} {inputType} {name} {placeholderLabelKey} />
