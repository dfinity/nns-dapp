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
  import { onDestroy } from "svelte";
  import { AuthStore, authStore } from "./lib/stores/auth.store";
  import Wallet from "./routes/Wallet.svelte";
  import ProposalDetail from "./routes/ProposalDetail.svelte";
  import { routeStore } from "./lib/stores/route.store";
  import { AppPath } from "./lib/constants/routes.constants";
  import Toasts from "./lib/components/ui/Toasts.svelte";
  import { syncAccounts } from "./lib/services/accounts.services";

  const unsubscribeAuth: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      // TODO: We do not need to load and sync the account data if we redirect to the Flutter app. Currently these data are not displayed with this application.
      if (process.env.REDIRECT_TO_LEGACY || !auth.identity) {
        return;
      }

      // TODO: L2-316 Manage errors
      await syncAccounts(auth);
    }
  );

  const unsubscribeRoute: Unsubscriber = routeStore.subscribe(
    ({ isKnownPath }) => {
      if (isKnownPath) {
        return;
      }
      // if the path is unsupported (to mock the flutter dapp) the user will be redirected to the first page (/accounts/) page (unknown path will not be saved in session History)
      routeStore.replace({ path: AppPath.Accounts });
    }
  );

  onDestroy(() => {
    unsubscribeAuth();
    unsubscribeRoute();
  });
</script>

<Guard>
  <Route path={AppPath.Authentication} component={Auth} />
  <PrivateRoute path={AppPath.Accounts} component={Accounts} />
  <PrivateRoute path={AppPath.Neurons} component={Neurons} />
  <PrivateRoute path={AppPath.Proposals} component={Proposals} />
  <PrivateRoute path={AppPath.Canisters} component={Canisters} />
  <PrivateRoute path={AppPath.Wallet} component={Wallet} />
  <PrivateRoute path={AppPath.ProposalDetail} component={ProposalDetail} />
</Guard>

<Toasts />

<style lang="scss" global>
  @import "./lib/themes/fonts.scss";
  @import "./lib/themes/variables.scss";
  @import "./lib/themes/theme.scss";
  @import "./lib/themes/button.scss";
</style>
