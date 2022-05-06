<script lang="ts">
  import { toastsStore } from "../../stores/toasts.store";
  import Toast from "./Toast.svelte";
</script>

<!-- We need the wrapper to avoid having an error in the tests -->
<!-- TypeError: Cannot read properties of null (reading 'removeChild') -->
<!-- https://github.com/sveltejs/svelte/issues/6037 -->
<div class="wrapper">
  {#each $toastsStore as msg (msg.id)}
    <Toast {msg} />
  {/each}
</div>

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

    @include media.min-width(large) {
      // A little narrowwer than the section to differentiate notifications from content
      max-width: calc(var(--section-max-width) - var(--padding-2x));
    }
  }
</style>
