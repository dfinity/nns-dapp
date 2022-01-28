<script lang="ts">
  import { authStore } from "../stores/auth.store";
  import { routeStore } from "../stores/route.store";
  import { routePath } from "../utils/route.utils";
  import Spinner from "./Spinner.svelte";
</script>

<!-- storage: on every change in local storage we sync the auth state -->
<!-- popstate: browser back button has been clicked, we reflect the new browser url to the route -->
<svelte:window
  on:storage={async () => await authStore.sync()}
  on:popstate={() => routeStore.update({ path: routePath() })}
/>

{#await authStore.sync()}
  <Spinner />
{:then value}
  <slot />
{:catch error}
  <!-- TODO(L2-176): display the errors -->
{/await}
