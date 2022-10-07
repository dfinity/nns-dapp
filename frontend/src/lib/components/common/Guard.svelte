<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { routeStore } from "$lib/stores/route.store";
  import { routePath } from "$lib/utils/route.utils";
  import { Spinner } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";

  const syncAuthStore = async () => {
    try {
      await authStore.sync();
    } catch (err) {
      toastsError({ labelKey: "error.auth_sync", err });
    }
  };
</script>

<!-- popstate: browser back button has been clicked, we reflect the new browser url to the route -->
<svelte:window on:popstate={() => routeStore.update({ path: routePath() })} />

{#await syncAuthStore()}
  <Spinner />
{:then}
  <slot />
{/await}
