<script lang="ts">
  import Input from "./Input.svelte";
  import { i18n } from "../../stores/i18n";
  import { createEventDispatcher } from "svelte";
  import MaxButton from "../common/MaxButton.svelte";

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
  <svelte:fragment slot="label">{$i18n.core.amount}</svelte:fragment>
  <MaxButton on:click={setMax} slot="additional" />
</Input>
