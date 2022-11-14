<script lang="ts">
  import { onMount } from "svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { goto } from "$app/navigation";

  onMount(async () => {
    if (!IS_TESTNET) {
      await goto(AppPath.Accounts, { replaceState: true });
      return;
    }

    layoutTitleStore.set($i18n.sns_launchpad.header);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

<RouteModule path={AppPath.Launchpad} />
