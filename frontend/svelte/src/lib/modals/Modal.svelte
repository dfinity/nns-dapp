<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import IconClose from "../icons/IconClose.svelte";
  import { createEventDispatcher } from "svelte";

  export let visible: boolean = false;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
</script>

{#if visible}
  <div class="modal" transition:fade>
    <div class="backdrop" on:click={close} />
    <div
      transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
      class="wrapper"
    >
      <div class="toolbar">
        <h2><slot name="title" /></h2>

        <button on:click|stopPropagation={close} aria-label="Close"
          ><IconClose /></button
        >
      </div>

      <div class="content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../themes/mixins/interaction";

  .modal {
    position: fixed;
    inset: 0;

    z-index: calc(var(--z-index) + 999);
  }

  .backdrop {
    position: absolute;
    inset: 0;

    background: rgba(var(--background-rgb), 0.8);

    @include interaction.tappable;
  }

  .wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;

    width: 320px;
    height: fit-content;
    max-width: calc(100vw - (4 * var(--padding)));
    max-height: calc(100vw - (2 * var(--padding)));
    min-height: 100px;

    background: white;

    border-radius: calc(2 * var(--border-radius));

    overflow: hidden;
  }

  .toolbar {
    padding: var(--padding) calc(2 * var(--padding));

    background: var(--gray-100);
    color: var(--gray-800);

    display: flex;
    justify-content: space-between;

    h2 {
      color: inherit;
      font-weight: 400;
      margin-bottom: 0;
      line-height: 1.5;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .content {
    overflow-y: scroll;
  }
</style>
