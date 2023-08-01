<script lang="ts">
  import { Spinner } from "@dfinity/gix-components";

  export let loading: boolean;
</script>

<slot />

{#if loading}
  <div class="spinner" data-tid="next-page-proposals-spinner">
    <Spinner inline />
  </div>
{/if}

<style lang="scss">
  .spinner {
    margin: var(--padding-4x) 0 0;
  }
</style>
