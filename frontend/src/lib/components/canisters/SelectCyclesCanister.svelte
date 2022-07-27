<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { createEventDispatcher, onMount } from "svelte";
  import FooterModal from "../../modals/FooterModal.svelte";
  import { i18n } from "../../stores/i18n";
  import {
    convertIcpToTCycles,
    convertTCyclesToIcpNumber,
  } from "../../utils/icp.utils";
  import Input from "../ui/Input.svelte";

  export let amount: number | undefined = undefined;
  export let icpToCyclesExchangeRate: bigint | undefined = undefined;
  export let minimumCycles: number | undefined = undefined;

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
    dispatcher("nnsSelectAmount", {
      amount: ICP.fromString(String(amount)),
    });
  };

  let enoughCycles: boolean;
  $: enoughCycles =
    minimumCycles === undefined ? true : (amountCycles ?? 0) >= minimumCycles;
</script>

<form
  on:submit|preventDefault={selectAmount}
  class="wizard-wrapper wrapper"
  data-tid="select-cycles-screen"
>
  <div class="content">
    <div class="inputs">
      <Input
        placeholderLabelKey="core.icp"
        inputType="icp"
        name="icp-amount"
        bind:value={amount}
        on:focus={() => (isChanging = "icp")}
        on:blur={() => (isChanging = undefined)}
        disabled={icpToCyclesExchangeRate === undefined}
      >
        <svelte:fragment slot="label">{$i18n.core.icp}</svelte:fragment>
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
        <svelte:fragment slot="label">
          {$i18n.canisters.t_cycles}
        </svelte:fragment>
      </Input>
    </div>
    <slot />
  </div>
  <FooterModal>
    <button
      type="button"
      class="secondary small"
      data-tid="select-cycles-button-back"
      on:click={() => dispatcher("nnsBack")}
      >{$i18n.canisters.edit_source}</button
    >
    <button
      type="submit"
      class="primary small"
      on:click={selectAmount}
      data-tid="select-cycles-button"
      disabled={!enoughCycles}>{$i18n.canisters.review_cycles_purchase}</button
    >
  </FooterModal>
</form>

<style lang="scss">
  .wizard-wrapper.wrapper {
    justify-content: space-between;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--padding-2x);

    flex: 1;
  }

  .inputs {
    display: flex;
    gap: var(--padding-2x);
    justify-content: center;
  }
</style>
