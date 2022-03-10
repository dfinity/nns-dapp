<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import IconClose from "../icons/IconClose.svelte";
  import { createEventDispatcher } from "svelte";
  import IconBackIosNew from "../icons/IconBackIosNew.svelte";
  import { i18n } from "../stores/i18n";

  export let visible: boolean = true;
  export let theme: "dark" | "light" = "light";
  export let size: "small" | "medium" = "small";
  // There is no way to know to know whether a parent is listening to the "nnsBack" event
  // https://github.com/sveltejs/svelte/issues/4249#issuecomment-573312191
  // Please do not use `showBackButton` without listening on `nnsBack`
  export let showBackButton: boolean = false;

  let showToolbar: boolean;
  $: showToolbar = $$slots.title ?? showBackButton;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");
  const back = () => dispatch("nnsBack");
</script>

{#if visible}
  <div
    class={`modal ${theme}`}
    transition:fade
    role="dialog"
    aria-labelledby={showToolbar ? "modalTitle" : undefined}
    aria-describedby="modalContent"
    on:click|stopPropagation
  >
    <div class="backdrop" on:click|stopPropagation={close} />
    <div
      transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
      class={`wrapper ${size}`}
    >
      {#if showToolbar}
        <div class="toolbar">
          {#if showBackButton}
            <button
              class="back"
              on:click|stopPropagation={back}
              aria-label={$i18n.core.back}><IconBackIosNew /></button
            >
          {/if}
          <h3 id="modalTitle"><slot name="title" /></h3>
          <button on:click|stopPropagation={close} aria-label={$i18n.core.close}
            ><IconClose /></button
          >
        </div>
      {/if}

      <div class="content" id="modalContent">
        <slot />
      </div>

      <slot name="footer" />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../themes/mixins/interaction";

  .modal {
    position: fixed;
    inset: 0;

    z-index: calc(var(--z-index) + 998);

    @include interaction.initial;

    &.dark {
      color: var(--background-contrast);

      .wrapper {
        background: none;
      }

      .toolbar {
        background: var(--gray-50-background);
        box-shadow: 0 2px 8px var(--background);

        h3,
        button {
          color: var(--background-contrast);
        }
      }

      .content {
        background: var(--gray-50-background);
        color: var(--gray-200);
      }
    }
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

    width: var(--modal-small-width);
    height: fit-content;
    max-width: calc(100vw - (4 * var(--padding)));
    max-height: calc(100vw - (2 * var(--padding)));

    --modal-min-height: 100px;
    --modal-toolbar-height: 35px;
    min-height: var(--modal-min-height);

    background: white;

    border-radius: calc(2 * var(--border-radius));

    overflow: hidden;

    &.medium {
      width: var(--modal-medium-width);
    }
  }

  .toolbar {
    padding: var(--padding) calc(2 * var(--padding));

    background: var(--gray-100);
    color: var(--gray-800);

    display: grid;
    --toolbar-icon-width: calc((var(--padding) / 2) + var(--icon-width));
    grid-template-columns: var(--toolbar-icon-width) 1fr var(
        --toolbar-icon-width
      );

    z-index: var(--z-index);

    height: var(--modal-toolbar-height);

    h3 {
      color: inherit;
      font-weight: 400;
      margin-bottom: 0;
      line-height: 1.5;
      text-align: center;
      grid-column-start: 2;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;

      &:active,
      &:focus,
      &:hover {
        background: rgba(var(--light-background-rgb), 0.3);
        border-radius: var(--border-radius);
      }
    }
  }

  .content {
    position: relative;

    display: flex;
    flex-direction: column;

    min-height: calc(var(--modal-min-height) - var(--modal-toolbar-height));
    max-height: calc(100vh - 156px);
    overflow-y: auto;
    overflow-x: hidden;

    color: var(--gray-800);
  }
</style>
