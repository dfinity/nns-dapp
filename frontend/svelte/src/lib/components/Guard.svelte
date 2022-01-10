<script lang="ts">
  import { authStore } from "../stores/auth.store";
  import { routeStore } from "../stores/route.store";
  import { routePath } from "../utils/route.utils";

  const navigateBack = () => routeStore.navigate({ path: routePath() });
</script>

<svelte:window
  on:storage={async () => await authStore.init()}
  on:popstate={navigateBack}
/>

{#await authStore.init()}
  <!-- TODO: display a spinner or other animation while loading the auth? -->
{:then value}
  <slot />
{:catch error}
  <!-- TODO: do we display the error? {error.message} -->
{/await}
