<script lang="ts">
  import { authStore } from "../../stores/auth.store";
  import { routeStore } from "../../stores/route.store";
  import { routePath } from "../../utils/route.utils";
  import Spinner from "../ui/Spinner.svelte";
  import { toastsStore } from "../../stores/toasts.store";

  const syncAuthStore = async () => {
    try {
      await authStore.sync();
    } catch (err) {
      toastsStore.error({ labelKey: "error.auth_sync", err });
    }
  };
</script>

<!-- storage: on every change in local storage we sync the auth state -->
<!-- popstate: browser back button has been clicked, we reflect the new browser url to the route -->
<svelte:window
  on:storage={async () => await authStore.sync()}
  on:popstate={() => routeStore.update({ path: routePath() })}
/>

{#await syncAuthStore()}
  <Spinner />
{:then}
  <slot />
{/await}
