<script lang="ts">
  import { onMount } from "svelte";
  import Input from "$lib/gix/components/Input.svelte";

  interface Props {
    inputType?: "text" | "icp" | "currency";
    name: string;
    value?: string;
    placeholder?: string;
    decimals?: number;
    amount?: string;
  }

  let {
    inputType = "text",
    name,
    value,
    placeholder = "test.placeholder",
    decimals = 8,
    amount = $bindable(),
  }: Props = $props();

  onMount(() => {
    amount = value;
  });

  // We want to test that we can change value programmatically
  const changeValue = () => {
    amount = "new value";
  };
</script>

<!-- eslint-disable svelte/valid-compile -->
<span id="test" onclick={changeValue} />

<Input {name} {decimals} {inputType} {placeholder} bind:value={amount} />
