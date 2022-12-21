<script lang="ts">
  import SelectCyclesCanister from "$lib/components/canisters/SelectCyclesCanister.svelte";
  import { NEW_CANISTER_MIN_T_CYCLES } from "$lib/constants/canisters.constants";
  import { i18n } from "$lib/stores/i18n";
  import { Html } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { formattedTransactionFeeICP } from "$lib/utils/token.utils";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";

  export let icpToCyclesExchangeRate: bigint | undefined;
  export let amount: number | undefined;
</script>

<SelectCyclesCanister
  {icpToCyclesExchangeRate}
  bind:amount
  on:nnsClose
  on:nnsBack
  on:nnsSelectAmount
  minimumCycles={NEW_CANISTER_MIN_T_CYCLES}
>
  <svelte:fragment slot="select-amount"
    >{$i18n.canisters.review_create_canister}</svelte:fragment
  >
  <div>
    <p class="description">{$i18n.canisters.minimum_cycles_text_1}</p>
    <p class="description">
      <Html
        text={replacePlaceholders($i18n.canisters.minimum_cycles_text_2, {
          $amount: valueSpan(
            formattedTransactionFeeICP($mainTransactionFeeStore)
          ),
        })}
      />
    </p>
  </div>
</SelectCyclesCanister>
