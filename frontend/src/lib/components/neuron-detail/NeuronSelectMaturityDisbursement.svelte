<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { createEventDispatcher } from "svelte";
  import { Html, KeyValuePair, InputRange } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import AddressInput from "$lib/components/accounts/AddressInput.svelte";
  import { invalidAddress } from "$lib/utils/accounts.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils.js";
  import { numberToE8s } from "$lib/utils/token.utils";

  export let rootCanisterId: Principal;
  export let formattedMaturity: string;
  export let tokenSymbol: string;
  export let destinationAddress: string | undefined = undefined;
  export let percentage = 0;

  let disabled = true;
  $: disabled =
    invalidAddress({
      address: destinationAddress,
      network: undefined,
      rootCanisterId,
    }) || percentage === 0;

  let maturityToDisburse: bigint;
  $: maturityToDisburse = numberToE8s(
    // Use toFixed to avoid Token validation error "Number X has more than 8 decimals"
    Number(((percentage / 100) * Number(formattedMaturity)).toFixed(8))
  );

  const dispatcher = createEventDispatcher();
</script>

<div class="container" data-tid="neuron-select-disbursement-component">
  <KeyValuePair>
    <span slot="key" class="label"
      >{$i18n.neuron_detail.available_maturity}</span
    >
    <span class="value" slot="value">{formattedMaturity}</span>
  </KeyValuePair>

  <span class="description">
    <Html
      text={replacePlaceholders(
        $i18n.neuron_detail.disburse_maturity_description_1,
        { $symbol: tokenSymbol }
      )}
    />
  </span>

  <span class="description">
    <Html
      text={replacePlaceholders(
        $i18n.neuron_detail.disburse_maturity_description_2,
        { $symbol: tokenSymbol }
      )}
    />
  </span>

  <div>
    <p class="description input-label">
      {$i18n.neuron_detail.disburse_maturity_destination}
    </p>
    <AddressInput
      qrCode={false}
      bind:address={destinationAddress}
      {rootCanisterId}
    />
  </div>

  <div class="percentage-container">
    <p class="description input-label">
      {$i18n.neuron_detail.disburse_maturity_amount}
    </p>
    <InputRange
      ariaLabel={$i18n.neuron_detail.maturity_range}
      min={0}
      max={100}
      bind:value={percentage}
    />
    <h5>
      <span class="description"
        >~{formatMaturity(maturityToDisburse)}
        {$i18n.neuron_detail.maturity}</span
      >
      {formatPercentage(percentage / 100, {
        minFraction: 0,
        maxFraction: 0,
      })}
    </h5>
  </div>
</div>

<div class="toolbar">
  <button class="secondary" on:click={() => dispatcher("nnsClose")}
    >{$i18n.core.cancel}</button
  >
  <button
    data-tid="select-maturity-percentage-button"
    class="primary"
    on:click={() => dispatcher("nnsSelect")}
    {disabled}
  >
    {$i18n.neuron_detail.disburse}
  </button>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .input-label {
    margin-bottom: var(--padding);
  }

  .percentage-container {
    width: 100%;

    h5 {
      margin-top: var(--padding);
      text-align: right;
    }
  }
</style>
