<script lang="ts">
  import { authSignedInStore } from "$lib/stores/auth.store";
</script>

{#if $authSignedInStore}
  <slot />
{/if}
