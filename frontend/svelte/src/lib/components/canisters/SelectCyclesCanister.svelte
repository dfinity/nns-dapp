<script lang="ts">
  import { onMount } from "svelte";
  import { getIcpToCyclesExchangeRate } from "../../services/canisters.services";
  import { i18n } from "../../stores/i18n";
  import { convertIcpToTCycles } from "../../utils/icp.utils";
  import Input from "../ui/Input.svelte";

  let icpToCyclesRatio: bigint | undefined;
  onMount(async () => {
    icpToCyclesRatio = await getIcpToCyclesExchangeRate();
  });

  let amountIcp: number;
  const updateCycles = () => {
    if (icpToCyclesRatio !== undefined) {
      console.log(amountIcp);
      amountCycles = Number(convertIcpToTCycles(amountIcp, icpToCyclesRatio));
    }
  };
  let amountCycles: number;
  const updateIcp = () => {
    console.log("update the other input");
  };

  $: {
    console.log(icpToCyclesRatio);
  }
</script>

<div class="wizard-wrapper wrapper">
  <div>
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
  <button class="primary full-width"
    >{$i18n.canisters.review_cycles_purchase}</button
  >
</div>

<style lang="scss">
  .wizard-wrapper.wrapper {
    justify-content: space-between;
  }
</style>
