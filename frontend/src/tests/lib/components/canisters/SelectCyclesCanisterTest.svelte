<script lang="ts">
  import SelectCyclesCanister from "$lib/components/canisters/SelectCyclesCanister.svelte";
  import en from "$tests/mocks/i18n.mock";

  export let icpToCyclesExchangeRate: bigint;
</script>

<SelectCyclesCanister {icpToCyclesExchangeRate}>
  <svelte:fragment slot="select-amount"
    >{en.canisters.review_cycles_purchase}</svelte:fragment
  >
</SelectCyclesCanister>
