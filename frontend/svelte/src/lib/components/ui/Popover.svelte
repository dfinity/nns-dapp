<!-- https://github.com/papyrs/papyrs/blob/main/src/lib/components/ui/Popover.svelte -->
<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import IconClose from "../../icons/IconClose.svelte";
  import { i18n } from "../../stores/i18n";
  import { debounce } from "../../utils/utils";
  import Backdrop from "./Backdrop.svelte";

  export let anchor: HTMLElement | undefined = undefined;
  export let visible = false;
  export let direction: "ltr" | "rtl" = "ltr";
  export let center = false;
  export let closeButton = false;

  let bottom: number;
  let left: number;
  let right: number;
  const initPosition = debounce(
    () =>
      ({ bottom, left, right } = anchor
        ? anchor.getBoundingClientRect()
        : { bottom: 0, left: 0, right: 0 })
  );
  $: anchor, visible, initPosition();
  const close = () => (visible = false);
</script>

<svelte:window on:resize={initPosition} />

{#if visible}
  <div
    role="menu"
    aria-orientation="vertical"
    transition:fade
    class="popover"
    tabindex="-1"
    style="--popover-top: {`${bottom}px`}; --popover-left: {`${left}px`}; --popover-right: {`${
      window.innerWidth - right
    }px`}"
    on:click|stopPropagation
  >
    <Backdrop on:nnsClose={() => (visible = false)} />
    <div
      transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
      class="wrapper"
      class:center
      class:rtl={direction === "rtl"}
    >
      {#if closeButton}
        <button
          on:click|stopPropagation={close}
          aria-label={$i18n.core.close}
          class="close icon"><IconClose /></button
        >
      {/if}

      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../../themes/mixins/overlay";

  .popover {
    @include overlay.popover;
  }
</style>
