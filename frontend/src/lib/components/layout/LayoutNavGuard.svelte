<script lang="ts">
  import { navigating } from "$app/stores";
  import { isNullish } from "@dfinity/utils";
</script>

<!-- Workaround for SvelteKit issue https://github.com/sveltejs/kit/issues/5434 -->
{#if isNullish($navigating)}
  <slot />
{/if}
