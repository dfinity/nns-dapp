<script lang="ts">
  import { toastsStore } from "../../stores/toasts.store";
  import Toast from "./Toast.svelte";
</script>

{#if $toastsStore.length > 0}
  <div class="wrapper">
    {#each $toastsStore as msg (msg.id)}
      <Toast {msg} />
    {/each}
  </div>
{/if}

<style lang="scss">
  @use "../../themes/mixins/media";
  .wrapper {
    position: fixed;
    bottom: var(--padding-2x);
    left: 50%;
    transform: translate(-50%, 0);

    // A little narrowwer than the section to differentiate notifications from content
    width: calc(100% - var(--padding-8x) - var(--padding-0_5x));

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    z-index: var(--toast-z-index);

    @include media.min-width(large) {
      // A little narrowwer than the section to differentiate notifications from content
      max-width: calc(var(--section-max-width) - var(--padding-2x));
    }
  }
</style>
