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
  import { authStore } from "./lib/stores/auth.store";
  import type { AuthStore } from "./lib/stores/auth.store";
  import Wallet from "./routes/Wallet.svelte";
  import ProposalDetail from "./routes/ProposalDetail.svelte";
  import { routeStore } from "./lib/stores/route.store";
  import { AppPath, SHOW_ANY_TABS } from "./lib/constants/routes.constants";
  import Toasts from "./lib/components/ui/Toasts.svelte";
  import { syncAccounts } from "./lib/services/accounts.services";
  import NeuronDetail from "./routes/NeuronDetail.svelte";
  import BusyScreen from "./lib/components/ui/BusyScreen.svelte";
  import { worker } from "./lib/services/worker.services";
  import { listNeurons } from "./lib/services/neurons.services";
  import CanisterDetail from "./routes/CanisterDetail.svelte";
  import { claimSeedNeurons } from "./lib/services/seed-neurons.services";

  const unsubscribeAuth: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      if (!SHOW_ANY_TABS) {
        return;
      }

      await worker.syncAuthIdle(auth);

      // TODO: We do not need to load and sync the account data if we redirect to the Flutter app. Currently these data are not displayed with this application.
      if (!auth.identity) {
        return;
      }

      await Promise.all([syncAccounts(), listNeurons()]);
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

  // TODO: Remove after all seed neurons have been claimed.
  // eslint-disable-next-line
  (window as any).claimSeedNeurons = claimSeedNeurons;

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
  <PrivateRoute path={AppPath.NeuronDetail} component={NeuronDetail} />
  <PrivateRoute path={AppPath.CanisterDetail} component={CanisterDetail} />
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
</style>
