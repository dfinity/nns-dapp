<script lang="ts">
  import { ICP } from "@dfinity/nns";

  import { createEventDispatcher, onMount } from "svelte";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { getIcpToCyclesExchangeRate } from "../../services/canisters.services";
  import { i18n } from "../../stores/i18n";
  import {
    convertIcpToTCycles,
    convertTCyclesToE8s,
  } from "../../utils/icp.utils";
  import Input from "../ui/Input.svelte";

  export let amount: number | undefined = undefined;

  let icpToCyclesRatio: bigint | undefined;
  onMount(async () => {
    icpToCyclesRatio = await getIcpToCyclesExchangeRate();
    // Update cycles input if the component is mounted with some `amount`
    if (icpToCyclesRatio !== undefined && amount !== undefined) {
      amountCycles = convertIcpToTCycles({
        icpNumber: amount,
        ratio: icpToCyclesRatio,
      });
    }
  });

  const updateCycles = () => {
    // Reset cycles
    if (amount === undefined) {
      amountCycles = undefined;
      return;
    }
    if (icpToCyclesRatio !== undefined) {
      amountCycles = convertIcpToTCycles({
        icpNumber: amount,
        ratio: icpToCyclesRatio,
      });
    }
  };
  let amountCycles: number | undefined;
  const updateIcp = () => {
    if (icpToCyclesRatio !== undefined && amountCycles !== undefined) {
      amount =
        Number(
          convertTCyclesToE8s({
            tCycles: amountCycles,
            ratio: icpToCyclesRatio,
          })
        ) / E8S_PER_ICP;
    }
  };

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
        on:blur={updateCycles}
        disabled={icpToCyclesRatio === undefined}
      />
      <Input
        placeholderLabelKey="canisters.t_cycles"
        inputType="number"
        name="t-cycles-amount"
        theme="dark"
        bind:value={amountCycles}
        on:blur={updateIcp}
        disabled={icpToCyclesRatio === undefined}
      />
    </div>
    <p>{$i18n.canisters.minimum_cycles_text}</p>
    <p>{$i18n.canisters.app_subnets_beta}</p>
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
