<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import { navigating } from "$app/stores";
  import { Spinner } from "@dfinity/gix-components";

  // To be used only when the transition between pages lasts long; otherwise, it can appear as being glitchy.
  export let spinnerWhileNavigating = false;
</script>

<!-- Workaround for SvelteKit issue https://github.com/sveltejs/kit/issues/5434 -->
{#if isNullish($navigating)}
  <slot />
{:else if spinnerWhileNavigating}
  <Spinner />
{/if}
