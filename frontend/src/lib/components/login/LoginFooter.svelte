<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { BREAKPOINT_LARGE, IconGitHub } from "@dfinity/gix-components";
  import MenuMetrics from "$lib/components/common/MenuMetrics.svelte";

  export let presentation: "footer" | "menu" = "footer";

  let innerWidth = 0;
  let displayTvl = false;

  // See comment in <LoginHeader />
  $: displayTvl =
    innerWidth > 0 && innerWidth <= BREAKPOINT_LARGE && presentation === "menu";
</script>

<svelte:window bind:innerWidth />

<footer
  class:footer={presentation === "footer"}
  class:menu={presentation === "menu"}
>
  {#if displayTvl}
    <div class="metrics">
      <MenuMetrics sticky={false} />
    </div>
  {/if}

  <span class="copyright">{$i18n.auth.copyright}</span>

  <a
    class="github"
    href="https://github.com/dfinity/nns-dapp"
    rel="noopener noreferrer external"
    target="_blank"
    alt={$i18n.auth.github_link}><IconGitHub /> <span>GitHub</span></a
  >
</footer>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/text";
  @use "@dfinity/gix-components/styles/mixins/media";

  a {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    text-decoration: none;

    span {
      @include text.truncate;
    }

    :global(svg) {
      vertical-align: bottom;
      margin-right: var(--padding);
    }

    &:active,
    &:focus,
    &:hover {
      color: var(--menu-select-color);
    }
  }

  .footer {
    display: none;

    @include media.min-width(large) {
      display: flex;
      justify-content: space-between;

      box-sizing: border-box;

      padding: var(--padding-4x) var(--padding-8x);

      @include fonts.small;

      z-index: var(--z-index);
    }
  }

  .menu {
    position: relative;

    display: flex;
    flex-direction: column-reverse;

    .copyright {
      padding: var(--padding) var(--padding-3x);
      font-size: var(--font-size-small);
      @include text.truncate;
    }

    a {
      padding: var(--padding-6x) var(--padding-3x) var(--padding);
      font-size: var(--font-size-small);
    }
  }

  .metrics {
    padding: 0 var(--padding);
  }
</style>
