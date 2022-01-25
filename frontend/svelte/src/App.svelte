<script lang="ts">
  import Route from "./lib/components/Route.svelte";
  import PrivateRoute from "./lib/components/PrivateRoute.svelte";
  import Guard from "./lib/components/Guard.svelte";
  import Accounts from "./routes/Accounts.svelte";
  import Neurons from "./routes/Neurons.svelte";
  import Proposals from "./routes/Proposals.svelte";
  import Canisters from "./routes/Canisters.svelte";
  import Auth from "./routes/Auth.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "./lib/stores/accounts.store";
  import { onDestroy } from "svelte";
  import { AuthStore, authStore } from "./lib/stores/auth.store";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      // TODO: We do not need to load and sync the account data if we redirect to the Flutter app. Currently these data are not displayed with this application.
      if (process.env.REDIRECT_TO_LEGACY) {
        return;
      }

      await accountsStore.sync(auth);
    }
  );

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
  <PrivateRoute path="/#/accounts" component={Accounts} />
  <PrivateRoute path="/#/neurons" component={Neurons} />
  <PrivateRoute path="/#/proposals" component={Proposals} />
  <PrivateRoute path="/#/canisters" component={Canisters} />
</Guard>

<style lang="scss" global>
  @import "./lib/themes/fonts.scss";
  @import "./lib/themes/variables.scss";
  @import "./lib/themes/theme.scss";
</style>
