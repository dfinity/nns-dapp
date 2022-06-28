<script lang="ts">
  import Route from "./lib/components/common/Route.svelte";
  import PrivateRoute from "./lib/components/common/PrivateRoute.svelte";
  import Guard from "./lib/components/common/Guard.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { onDestroy } from "svelte";
  import { authStore } from "./lib/stores/auth.store";
  import type { AuthStore } from "./lib/stores/auth.store";
  import { routeStore } from "./lib/stores/route.store";
  import { AppPath } from "./lib/constants/routes.constants";
  import Toasts from "./lib/components/ui/Toasts.svelte";
  import { syncAccounts } from "./lib/services/accounts.services";
  import BusyScreen from "./lib/components/ui/BusyScreen.svelte";
  import { worker } from "./lib/services/worker.services";
  import { listNeurons } from "./lib/services/neurons.services";
  import { loadMainTransactionFee } from "./lib/services/transaction-fees.services";

  const unsubscribeAuth: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      await worker.syncAuthIdle(auth);

      // TODO: We do not need to load and sync the account data if we redirect to the Flutter app. Currently these data are not displayed with this application.
      if (!auth.identity) {
        return;
      }

      await Promise.all([
        syncAccounts(),
        listNeurons(),
        loadMainTransactionFee(),
      ]);
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
  <Route path={AppPath.Authentication} />
  <PrivateRoute path={AppPath.Accounts} />
  <PrivateRoute path={AppPath.Neurons} />
  <PrivateRoute path={AppPath.Proposals} />
  <PrivateRoute path={AppPath.Canisters} />
  <PrivateRoute path={AppPath.Wallet} />
  <PrivateRoute path={AppPath.ProposalDetail} />
  <PrivateRoute path={AppPath.NeuronDetail} />
  <PrivateRoute path={AppPath.CanisterDetail} />
  <PrivateRoute path={AppPath.SNSLaunchpad} />
  <PrivateRoute path={AppPath.SNSProjectDetail} />
</Guard>

<Toasts />
<BusyScreen />

<style lang="scss" global>
  @import "./lib/themes/fonts.scss";
  @import "./lib/themes/variables.scss";
  @import "./lib/themes/theme.scss";
  @import "./lib/themes/button.scss";
  @import "./lib/themes/link.scss";
  @import "./lib/themes/modal.scss";
  @import "./lib/themes/themes/dark.scss";
  @import "./lib/themes/themes/light.scss";
  @import "./lib/themes/colors.scss";
</style>
