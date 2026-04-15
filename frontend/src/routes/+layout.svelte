<script lang="ts">
  import Alfred from "$lib/components/alfred/Alfred.svelte";
  import Highlight from "$lib/components/ui/Highlight.svelte";
  import NewNnsAppBanner from "$lib/components/ui/NewNnsAppBanner.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
  import { initAnalytics } from "$lib/services/analytics.services";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { getRefreshStakingRewards } from "$lib/services/staking-rewards.service";
  import {
    initAuthWorker,
    type AuthWorker,
  } from "$lib/services/worker-auth.services";
  import { authStore, type AuthStoreData } from "$lib/stores/auth.store";

  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";
  import { i18n } from "$lib/stores/i18n";
  import { networkEconomicsStore } from "$lib/stores/network-economics.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { nnsTotalVotingPowerStore } from "$lib/stores/nns-total-voting-power.store";
  import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import { tickersStore } from "$lib/stores/tickers.store";
  import { toastsClean } from "$lib/stores/toasts.store";
  import { logWithTimestamp } from "$lib/utils/dev.utils";
  import { onMount } from "svelte";

  let ready = false;
  let worker: AuthWorker | undefined;

  logWithTimestamp("#4124:s1");

  const syncAuth = async (auth: AuthStoreData) => {
    worker?.syncAuthIdle(auth);

    if (!auth.identity) {
      ready = false;
      return;
    }

    // syncAuth is triggered each time the auth changes but also when the worker is initialized to avoid race condition.
    // As the function can be called twice with a valid identity, we use a flag to only init the data once.
    if (ready) {
      return;
    }

    ready = true;

    // We reset the toast to clear any previous messages.
    // This is notably user-friendly in case of the user would have been sign-out automatically - session duration expired.
    // That way user does not have to manually close previous message.
    toastsClean();

    // Load app global stores data
    await initAppPrivateDataProxy();
  };

  onMount(async () => {
    initAnalytics();

    logWithTimestamp("#4124:s1:before worker");
    worker = await initAuthWorker();
    logWithTimestamp("#4124:s1:worker initialized", worker);

    await syncAuth($authStore);
    logWithTimestamp("#4124:s1:syncAuth");
  });

  $: syncAuth($authStore);

  // Load ICP swap tickers for the Staking Rewards
  loadIcpSwapTickers();
  const refreshStakingRewards = getRefreshStakingRewards();
  $: {
    refreshStakingRewards({
      auth: $authSignedInStore,
      tokens: $tokensListUserStore,
      snsProjects: $snsAggregatorStore,
      snsNeurons: $snsNeuronsStore,
      nnsNeurons: $neuronsStore,
      nnsEconomics: $networkEconomicsStore,
      fxRates: $tickersStore,
      // @TODO UPDATE MISSION 70 force new number until the API catches up, then remove this
      governanceMetrics:
        // eslint-disable-next-line no-constant-condition
        IS_TESTNET || 1
          ? ({
              metrics: { totalSupplyIcp: 550_775_607n },
            } as typeof $governanceMetricsStore)
          : $governanceMetricsStore,
      // @TODO UPDATE MISSION 70 force new number until the API catches up, then remove this
      nnsTotalVotingPower:
        // eslint-disable-next-line no-constant-condition
        IS_TESTNET || 1 ? 88_150_266_299_091_680n : $nnsTotalVotingPowerStore,
    });
  }
</script>

<Alfred />

{#if !$authSignedInStore}
  <NewNnsAppBanner />
{/if}

{#if $authSignedInStore}
  <Highlight
    level="info"
    title={$i18n.highlight.new_nns_app_title}
    description={$i18n.highlight.new_nns_app_description}
    id="new-nns-app"
    link="https://nns.internetcomputer.org"
  />
{/if}

<slot />

<style lang="scss" global>
  @import "@dfinity/gix-components/dist/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/global";
  @import "../lib/themes/variables";
</style>
