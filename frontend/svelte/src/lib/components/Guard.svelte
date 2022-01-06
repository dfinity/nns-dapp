<script lang="ts">
  import { authStore } from '../stores/auth.store';
</script>

<svelte:window on:storage={async () => await authStore.init()} />

{#await authStore.init()}
  <!-- TODO: display a spinner or other animation while loading the auth? -->
{:then value}
  <slot />
{:catch error}
  <!-- TODO: do we display the error? {error.message} -->
{/await}
