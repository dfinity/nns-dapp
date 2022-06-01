<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { createEventDispatcher, onMount } from "svelte";
  import { i18n } from "../../stores/i18n";
  import {
    convertIcpToTCycles,
    convertTCyclesToIcpNumber,
  } from "../../utils/icp.utils";
  import Input from "../ui/Input.svelte";

  export let amount: number | undefined = undefined;
  export let icpToCyclesRatio: bigint | undefined = undefined;

  let isChanging: "icp" | "tCycles" | undefined = undefined;
  let amountCycles: number | undefined;

  // Update cycles input if the component is mounted with some `amount`
  onMount(() => setCycles());

  const setCycles = () =>
    (amountCycles =
      amount !== undefined && icpToCyclesRatio !== undefined
        ? convertIcpToTCycles({
            icpNumber: amount,
            ratio: icpToCyclesRatio,
          })
        : undefined);

  const setAmount = () =>
    (amount =
      amountCycles !== undefined && icpToCyclesRatio !== undefined
        ? convertTCyclesToIcpNumber({
            tCycles: amountCycles,
            ratio: icpToCyclesRatio,
          })
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
  const selectAccount = () => {
    dispatcher("nnsSelectAmount", {
      amount: ICP.fromString(String(amount)),
    });
  };
  // TODO: Add validations - https://dfinity.atlassian.net/browse/L2-644
</script>

<div class="wizard-wrapper wrapper" data-tid="select-cycles-screen">
  <div class="content">
    <div class="inputs">
      <Input
        placeholderLabelKey="core.icp"
        inputType="icp"
        name="icp-amount"
        theme="dark"
        bind:value={amount}
        on:focus={() => (isChanging = "icp")}
        on:blur={() => (isChanging = undefined)}
        disabled={icpToCyclesRatio === undefined}
      />
      <Input
        placeholderLabelKey="canisters.t_cycles"
        inputType="icp"
        name="t-cycles-amount"
        theme="dark"
        bind:value={amountCycles}
        on:focus={() => (isChanging = "tCycles")}
        on:blur={() => (isChanging = undefined)}
        disabled={icpToCyclesRatio === undefined}
      />
    </div>
    <p>{$i18n.canisters.minimum_cycles_text}</p>
  </div>
  <button
    class="primary full-width"
    on:click={selectAccount}
    data-tid="select-cycles-button"
    >{$i18n.canisters.review_cycles_purchase}</button
  >
</div>

<style lang="scss">
  .wizard-wrapper.wrapper {
    justify-content: space-between;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }

  .inputs {
    display: flex;
    gap: var(--padding-2x);
  }
</style>
