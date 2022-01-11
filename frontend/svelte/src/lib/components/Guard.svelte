<script lang="ts">
  import { authStore } from "../stores/auth.store";
</script>

<svelte:window on:storage={async () => await authStore.init()} />

{#await authStore.init()}
  <!-- TODO(L2-175): display a spinner or other animation while loading the auth -->
{:then value}
  <slot />
{:catch error}
  <!-- TODO(L2-176): display the errors -->
{/await}
