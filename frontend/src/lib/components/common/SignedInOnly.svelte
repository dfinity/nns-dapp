<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

{#if $authSignedInStore}
  <slot />
{/if}
