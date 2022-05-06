<script lang="ts">
  import { toastsStore } from "../../stores/toasts.store";
  import Toast from "./Toast.svelte";
</script>

<!-- We need the wrapper to avoid having an error in the tests -->
<!-- TypeError: Cannot read properties of null (reading 'removeChild') -->
<!-- https://github.com/sveltejs/svelte/issues/6037 -->
<div class="wrapper">
  {#each $toastsStore as msg (msg.timestamp)}
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

    width: calc(100% - var(--padding-8x));

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    @include media.min-width(large) {
      max-width: var(--section-max-width);
    }
  }
</style>
