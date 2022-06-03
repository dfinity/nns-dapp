<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import IconClose from "../icons/IconClose.svelte";
  import { createEventDispatcher } from "svelte";
  import IconBackIosNew from "../icons/IconBackIosNew.svelte";
  import { i18n } from "../stores/i18n";
  import { busy } from "../stores/busy.store";
  import { triggerDebugReport } from "../utils/dev.utils";

  export let visible: boolean = true;
  export let theme: "dark" | "light" = "light";
  export let size: "small" | "big" = "small";
  export let testId: string | undefined = undefined;

  // There is no way to know whether a parent is listening to the "nnsBack" event
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
    data-tid={testId}
    aria-labelledby={showToolbar ? "modalTitle" : undefined}
    aria-describedby="modalContent"
    on:click|stopPropagation
    on:introend
  >
    <div
      class="backdrop"
      on:click|stopPropagation={close}
      class:disabledActions={$busy}
    />
    <div
      transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
      class={`wrapper ${size}`}
    >
      {#if showToolbar}
        <div class="toolbar">
          {#if showBackButton}
            <button
              transition:fade={{ duration: 150 }}
              class="back"
              on:click|stopPropagation={back}
              aria-label={$i18n.core.back}
              disabled={$busy}><IconBackIosNew /></button
            >
          {/if}
          <h3 id="modalTitle" use:triggerDebugReport><slot name="title" /></h3>
          <button
            data-tid="close-modal"
            on:click|stopPropagation={close}
            aria-label={$i18n.core.close}
            disabled={$busy}><IconClose /></button
          >
        </div>
      {/if}

      <div class="content" id="modalContent" class:small={size === "small"}>
        <slot />
      </div>

      <slot name="footer" />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../themes/mixins/interaction";
  @use "../themes/mixins/text";

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

        button {
          &[disabled] {
            color: var(--gray-600);
          }
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

    &.disabledActions {
      cursor: inherit;
      pointer-events: none;
    }
  }

  .wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;

    width: var(--modal-small-width);

    &.big {
      width: var(--modal-big-width);
    }

    --modal-wrapper-height: min(
      calc(100vh - var(--padding-6x)),
      var(--modal-max-height)
    );

    height: var(--modal-wrapper-height);
    max-width: calc(100vw - var(--padding-4x));

    --modal-toolbar-height: 35px;

    background: white;

    border-radius: calc(2 * var(--border-radius));

    overflow: hidden;
  }

  .light > div.wrapper {
    --scrollbar-light-background: var(--gray-50-background-contrast);
    ::-webkit-scrollbar {
      background: var(--scrollbar-light-background);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--light-background-shade);
      border: solid 2.5px var(--scrollbar-light-background);
    }
    ::-webkit-scrollbar-corner {
      background: var(--light-background);
    }
  }

  .toolbar {
    padding: var(--padding) var(--padding-2x);

    background: var(--gray-50);
    color: var(--gray-50-background);

    display: grid;
    --toolbar-icon-width: calc((var(--padding) / 2) + var(--icon-width));
    grid-template-columns: var(--toolbar-icon-width) 1fr var(
        --toolbar-icon-width
      );

    z-index: var(--z-index);

    height: var(--modal-toolbar-height);

    h3 {
      @include text.clamp(1);

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

    height: calc(100% - var(--modal-toolbar-height));
    overflow-y: auto;
    overflow-x: hidden;

    color: var(--gray-50-background);
  }

  .small {
    height: fit-content;
    max-height: var(--modal-wrapper-height);
  }
</style>
