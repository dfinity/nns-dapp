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
  import BusyScreen from "./lib/components/ui/BusyScreen.svelte";
  import { worker } from "./lib/services/worker.services";
  import { initApp } from "./lib/services/app.services";
  import { voteInProgressStore } from "./lib/stores/voting.store";
  import { syncBeforeUnload } from "./lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "./lib/utils/proposals.utils";

  const unsubscribeAuth: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      await worker.syncAuthIdle(auth);

      if (!auth.identity) {
        return;
      }

      await initApp();
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

  const unsubscribeVoteInProgress: Unsubscriber = voteInProgressStore.subscribe(
    ({ votes }) => syncBeforeUnload(voteRegistrationActive(votes))
  );

  onDestroy(() => {
    unsubscribeAuth();
    unsubscribeRoute();
    unsubscribeVoteInProgress();
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
  <PrivateRoute path={AppPath.Launchpad} />
  <PrivateRoute path={AppPath.ProjectDetail} />
  <PrivateRoute path={AppPath.SnsNeuronDetail} />
</Guard>

<Toasts />
<BusyScreen />

<style lang="scss" global>
  @import "@dfinity/gix-components/styles/global.scss";
  @import "lib/themes/legacy";
  @import "lib/themes/variables";
</style>
