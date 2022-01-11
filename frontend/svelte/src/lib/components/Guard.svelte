<script lang="ts">
  import { authStore } from "../stores/auth.store";
  import { routeStore } from "../stores/route.store";
  import { routePath } from "../utils/route.utils";

  // Browser back button has been clicked, we reflect the new browser url to the route
  const updateRoute = () => routeStore.update({ path: routePath() });
</script>

<svelte:window
  on:storage={async () => await authStore.init()}
  on:popstate={updateRoute}
/>

{#await authStore.init()}
  <!-- TODO(L2-175): display a spinner or other animation while loading the auth -->
{:then value}
  <slot />
{:catch error}
  <!-- TODO(L2-176): display the errors -->
{/await}
