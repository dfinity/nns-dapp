<script lang="ts">
  import { onMount } from "svelte";
  import { OWN_CANISTER_ID } from "../lib/constants/canister-ids.constants";
  import { ENABLE_SNS_2 } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import NnsWallet from "../lib/pages/NnsWallet.svelte";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS_2 &&
      isRoutePath({
        paths: [AppPath.LegacyWallet],
        routePath: $routeStore.path,
      })
    ) {
      routeStore.changeContext(OWN_CANISTER_ID.toText());
    }
  });
</script>

<NnsWallet />
