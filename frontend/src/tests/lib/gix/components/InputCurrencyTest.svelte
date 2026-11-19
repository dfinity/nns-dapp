<script lang="ts">
  import Input from "$lib/gix/components/Input.svelte";

  interface Props {
    name: string;
    placeholder: string;
    decimals?: number;
    value?: string;
  }

  let {
    name,
    placeholder,
    decimals = 8,
    value = $bindable(),
  }: Props = $props();
</script>

<Input {name} {decimals} inputType="currency" {placeholder} bind:value />
<p>Amount: <output data-tid="amount-decimals-output">{value ?? ""}</output></p>
