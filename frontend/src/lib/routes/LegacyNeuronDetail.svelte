<script lang="ts">
  import { onMount } from "svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import { AppPathLegacy } from "$lib/constants/routes.constants";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { isRoutePath } from "$lib/utils/app-path.utils";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (
      ENABLE_SNS &&
      isRoutePath({
        paths: [AppPathLegacy.LegacyNeuronDetail],
        routePath: $routeStore.path,
      })
    ) {
      routeStore.changeContext(OWN_CANISTER_ID.toText());
    }
  });
</script>

<NnsNeuronDetail />
