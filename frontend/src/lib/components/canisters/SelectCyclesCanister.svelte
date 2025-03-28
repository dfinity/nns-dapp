<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { areEnoughCyclesSelected } from "$lib/utils/canisters.utils";
  import {
    convertIcpToTCycles,
    convertTCyclesToIcpNumber,
  } from "$lib/utils/token.utils";
  import { Spinner } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher, onMount } from "svelte";

  export let amount: number | undefined = undefined;
  export let icpToCyclesExchangeRate: bigint | undefined = undefined;
  export let minimumCycles: number | undefined = undefined;
  export let backAction = true;

  let isChanging: "icp" | "tCycles" | undefined = undefined;
  let amountCycles: number | undefined;

  // Update cycles input if the component is mounted with some `amount`
  onMount(() => setCycles());

  const setCycles = () =>
    (amountCycles =
      amount !== undefined && icpToCyclesExchangeRate !== undefined
        ? // ICP Input misbehaves with more than eight decimals
          Number(
            convertIcpToTCycles({
              icpNumber: amount,
              exchangeRate: icpToCyclesExchangeRate,
            }).toFixed(8)
          )
        : undefined);

  const setAmount = () =>
    (amount =
      amountCycles !== undefined && icpToCyclesExchangeRate !== undefined
        ? // ICP Input misbehaves with more than eight decimals
          Number(
            convertTCyclesToIcpNumber({
              tCycles: amountCycles,
              exchangeRate: icpToCyclesExchangeRate,
            }).toFixed(8)
          )
        : undefined);

  $: amount,
    amountCycles,
    (() => {
      switch (isChanging) {
        case "icp":
          setCycles();
          break;
        case "tCycles":
          setAmount();
      }
    })();

  const dispatcher = createEventDispatcher();
  const selectAmount = () => {
    dispatcher("nnsSelectAmount");
  };

  let enoughCycles: boolean;
  $: enoughCycles = areEnoughCyclesSelected({ amountCycles, minimumCycles });
</script>

<form on:submit|preventDefault={selectAmount} data-tid="select-cycles-screen">
  <div class="inputs">
    <Input
      testId="select-cycles-icp-input"
      placeholderLabelKey="core.icp"
      inputType="icp"
      name="icp-amount"
      bind:value={amount}
      on:focus={() => (isChanging = "icp")}
      on:blur={() => (isChanging = undefined)}
      disabled={icpToCyclesExchangeRate === undefined}
    >
      <span class="label" slot="label">{$i18n.core.icp}</span>
      <svelte:fragment slot="inner-end">
        {#if isNullish(icpToCyclesExchangeRate)}
          <Spinner inline size="small" />
        {/if}
      </svelte:fragment>
    </Input>

    <Input
      placeholderLabelKey="canisters.t_cycles"
      inputType="icp"
      name="t-cycles-amount"
      bind:value={amountCycles}
      on:focus={() => (isChanging = "tCycles")}
      on:blur={() => (isChanging = undefined)}
      disabled={icpToCyclesExchangeRate === undefined}
    >
      <span class="label" slot="label">
        {$i18n.canisters.t_cycles}
      </span>

      <svelte:fragment slot="inner-end">
        {#if isNullish(icpToCyclesExchangeRate)}
          <Spinner inline size="small" />
        {/if}
      </svelte:fragment>
    </Input>
  </div>
  <slot />

  <div class="toolbar">
    {#if backAction}
      <button
        type="button"
        class="secondary"
        data-tid="select-cycles-button-back"
        on:click={() => dispatcher("nnsBack")}
        >{$i18n.canisters.change_source}</button
      >
    {/if}
    <button
      type="submit"
      class="primary"
      on:click={selectAmount}
      data-tid="select-cycles-button"
      disabled={!enoughCycles}
    >
      <slot name="select-amount" />
    </button>
  </div>
</form>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .inputs {
    display: grid;
    grid-template-columns: repeat(2, 50%);
    gap: var(--padding-2x);
    width: calc(100% - var(--padding-2x));
  }

  .label {
    @include fonts.small();
    color: var(--text-description);
  }
</style>
