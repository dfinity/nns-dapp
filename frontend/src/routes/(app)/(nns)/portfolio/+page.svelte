<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import Portfolio from "$lib/pages/Portfolio.svelte";
  import { loadCkBTCTokens } from "$lib/services/ckbtc-tokens.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { balanceLoader } from "$lib/utils/accounts-balances.utils";
  import { onMount } from "svelte";

  onMount(() => {
    balanceLoader.reset();
    loadCkBTCTokens();
    loadIcpSwapTickers();
  });

  $: if ($authSignedInStore) {
    balanceLoader.loadAllBalances({
      snsProjects: $snsProjectsCommittedStore,
      ckBTCUniverses: $ckBTCUniversesStore,
      icrcCanisters: $icrcCanistersStore,
    });
  }
</script>

<TestIdWrapper testId="portfolio-route-component"><Portfolio /></TestIdWrapper>
