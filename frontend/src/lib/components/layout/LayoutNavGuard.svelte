<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import { navigating } from "$app/stores";
</script>

<!-- Workaround for SvelteKit issue https://github.com/sveltejs/kit/issues/5434 -->
{#if isNullish($navigating)}
  <slot />
{/if}
