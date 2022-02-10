<script lang="ts">
  import Route from "./lib/components/common/Route.svelte";
  import PrivateRoute from "./lib/components/common/PrivateRoute.svelte";
  import Guard from "./lib/components/common/Guard.svelte";
  import Accounts from "./routes/Accounts.svelte";
  import Neurons from "./routes/Neurons.svelte";
  import Proposals from "./routes/Proposals.svelte";
  import Canisters from "./routes/Canisters.svelte";
  import Auth from "./routes/Auth.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "./lib/stores/accounts.store";
  import { onDestroy, SvelteComponent } from "svelte";
  import { AuthStore, authStore } from "./lib/stores/auth.store";
  import Wallet from "./routes/Wallet.svelte";
  import ProposalDetail from "./routes/ProposalDetail.svelte";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      // TODO: We do not need to load and sync the account data if we redirect to the Flutter app. Currently these data are not displayed with this application.
      if (process.env.REDIRECT_TO_LEGACY) {
        return;
      }

      await accountsStore.sync(auth);
    }
  );

  // Prepared in const to avoid svelte processing the path (eg "/[a-zA-Z0-9]{64}")
  const privateRoutes: { path: string; component: typeof SvelteComponent }[] = [
    { path: "/#/accounts", component: Accounts },
    { path: "/#/neurons", component: Neurons },
    { path: "/#/proposals", component: Proposals },
    { path: "/#/canisters", component: Canisters },
    // TODO: TBD
    { path: "/#/wallet/[a-zA-Z0-9]+", component: Wallet },
    // TODO: TBD
    { path: "/#/proposal/[0-9]+", component: ProposalDetail },
  ];

  onDestroy(unsubscribe);
</script>

<svelte:head>
  {#if !process.env.ROLLUP_WATCH}
    <!-- This is just a default; need to examine the CSP carefully and lock down accordingly. -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; child-src 'none';"
    />
  {/if}
</svelte:head>

<Guard>
  <Route path="/" component={Auth} />
  {#each privateRoutes as route}
    <PrivateRoute path={route.path} component={route.component} />
  {/each}
</Guard>

<style lang="scss" global>
  @import "./lib/themes/fonts.scss";
  @import "./lib/themes/variables.scss";
  @import "./lib/themes/theme.scss";
  @import "./lib/themes/button.scss";
</style>
