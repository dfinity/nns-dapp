<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { createEventDispatcher } from "svelte";
  import { Html } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import AddressInput from "$lib/components/accounts/AddressInput.svelte";
  import { invalidAddress } from "$lib/utils/accounts.utils";
  import { numberToE8s } from "$lib/utils/token.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import { maturityPercentageToE8s } from "$lib/utils/sns-neuron.utils";

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
  $: maturityToDisburse = maturityPercentageToE8s({
    percentage,
    total: Number(formattedMaturity),
  });

  const dispatcher = createEventDispatcher();
</script>

<TestIdWrapper testId="neuron-select-disbursement-component">
  <NeuronSelectPercentage
    buttonText={$i18n.neuron_detail.disburse}
    on:nnsSelectPercentage={() => dispatcher("nnsSelect")}
    on:nnsCancel={() => dispatcher("nnsClose")}
    bind:percentage
    disabled={percentage === 0}
    {formattedMaturity}
  >
    <div class="container" slot="description">
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
        <p>
          {replacePlaceholders(
            $i18n.neuron_detail.disburse_maturity_destination,
            { $symbol: tokenSymbol }
          )}
        </p>
        <AddressInput
          qrCode={false}
          bind:address={destinationAddress}
          {rootCanisterId}
        />
      </div>
    </div>

    <svelte:fragment slot="text">
      {$i18n.neuron_detail.disburse_maturity_amount}
    </svelte:fragment>
  </NeuronSelectPercentage>
</TestIdWrapper>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    margin: var(--padding-2x) 0 0;
  }

  .percentage-container {
    width: 100%;

    h5 {
      margin-top: var(--padding);
      text-align: right;
    }
  }
</style>
