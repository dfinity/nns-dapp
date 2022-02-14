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
  import { onDestroy } from "svelte";
  import { AuthStore, authStore } from "./lib/stores/auth.store";
  import Wallet from "./routes/Wallet.svelte";
  import ProposalDetails from "./routes/ProposalDetails.svelte";
  import { AppPath, isRoutePath } from "./routes/routes";
  import { routeStore } from "./lib/stores/route.store";

  const unsubscribeAuth: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      // TODO: We do not need to load and sync the account data if we redirect to the Flutter app. Currently these data are not displayed with this application.
      if (process.env.REDIRECT_TO_LEGACY) {
        return;
      }

      await accountsStore.sync(auth);
    }
  );

  const unsubscribeRoute = routeStore.subscribe((route) => {
    // redirects to /#/accounts in case of unknown url
    const currentKnownPath = Object.values(AppPath).find((path) =>
      isRoutePath({ path, routePath: route.path })
    );
    if (!currentKnownPath) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  onDestroy(() => {
    unsubscribeAuth();
    unsubscribeRoute();
  });
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
  <Route path={AppPath.Authentication} component={Auth} />
  <PrivateRoute path={AppPath.Accounts} component={Accounts} />
  <PrivateRoute path={AppPath.Neurons} component={Neurons} />
  <PrivateRoute path={AppPath.Proposals} component={Proposals} />
  <PrivateRoute path={AppPath.Canisters} component={Canisters} />
  <PrivateRoute path={AppPath.Wallet} component={Wallet} />
  <PrivateRoute path={AppPath.ProposalDetails} component={ProposalDetails} />
</Guard>

<style lang="scss" global>
  @import "./lib/themes/fonts.scss";
  @import "./lib/themes/variables.scss";
  @import "./lib/themes/theme.scss";
  @import "./lib/themes/button.scss";
</style>
