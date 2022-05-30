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

  let icpToCyclesRatio: bigint | undefined;
  onMount(async () => {
    icpToCyclesRatio = await getIcpToCyclesExchangeRate();
  });

  let amountIcp: number;
  const updateCycles = () => {
    if (icpToCyclesRatio !== undefined) {
      amountCycles = convertIcpToTCycles({
        icpNumber: amountIcp,
        ratio: icpToCyclesRatio,
      });
    }
  };
  let amountCycles: number;
  const updateIcp = () => {
    if (icpToCyclesRatio !== undefined) {
      amountIcp =
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
      amount: ICP.fromString(String(amountIcp)),
    });
  };
</script>

<div class="wizard-wrapper wrapper" data-tid="select-cycles-screen">
  <div class="content">
    <div class="inputs">
      <Input
        placeholderLabelKey="core.icp"
        inputType="icp"
        name="icp-amount"
        theme="dark"
        bind:value={amountIcp}
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
