<script lang="ts">
  import Input from "./Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";

  export let amount: number | undefined = undefined;
  export let max: number | undefined = undefined;

  const dispatch = createEventDispatcher();
  const setMax = () => dispatch("nnsMax");
</script>

<Input
  placeholderLabelKey="core.amount"
  name="amount"
  bind:value={amount}
  {max}
  inputType="icp"
>
  <button
    type="button"
    on:click|preventDefault={setMax}
    class="primary small"
    slot="button">{$i18n.core.max}</button
  >
</Input>
