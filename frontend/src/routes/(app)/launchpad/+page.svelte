<script lang="ts">
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  onMount(async () => {
    layoutTitleStore.set($i18n.sns_launchpad.header);
  });
</script>

<RouteModule path={AppPath.Launchpad} />
