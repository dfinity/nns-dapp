<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import GetTokensModal from "$lib/components/ic/GetTokensModal.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { IconAccountBalance } from "@dfinity/gix-components";

  let visible = false;

  const onClose = () => {
    visible = false;
  };
</script>

<TestIdWrapper testId="get-tokens-component">
  {#if $authSignedInStore}
    <button
      role="menuitem"
      data-tid="get-tokens-button"
      on:click|preventDefault|stopPropagation={() => (visible = true)}
      class="open"
    >
      <IconAccountBalance />
      <span>Get Tokens</span>
    </button>
  {/if}

  {#if visible}
    <GetTokensModal on:nnsClose={onClose} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .open {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    @include fonts.h5;

    color: var(--menu-color);

    padding: var(--padding);

    &:focus,
    &:hover {
      color: var(--menu-select-color);
    }

    span {
      margin: 0 var(--padding) 0 var(--padding-2x);
    }

    z-index: var(--z-index);

    :global(svg) {
      width: var(--padding-3x);
      min-width: var(--padding-3x);
      height: var(--padding-3x);
    }

    span {
      white-space: nowrap;
    }
  }
</style>
