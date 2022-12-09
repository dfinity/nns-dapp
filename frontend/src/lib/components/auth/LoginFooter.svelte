<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconGitHub } from "@dfinity/gix-components";

  export let presentation: "footer" | "menu" = "footer"
</script>

<footer class:footer={presentation === "footer"} class:menu={presentation === "menu"}>
    <span class="copyright">{$i18n.auth.copyright}</span>

    <a
            class="github"
            href="https://github.com/dfinity/nns-dapp"
            rel="noopener noreferrer"
            alt={$i18n.auth.github_link}><IconGitHub /> <span>GitHub</span></a
    >
</footer>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/text";

  .footer {
    display: none;

    @media (min-width: 1024px) and (min-height: 820px) {
      display: flex;
      justify-content: space-between;

      box-sizing: border-box;

      padding: var(--padding-4x) var(--padding-8x);

      @include fonts.small;
    }
  }

  .menu {
    position: relative;

    display: flex;
    flex-direction: column-reverse;

    .copyright {
      padding: var(--padding) var(--padding-4x);
      font-size: var(--font-size-small);
      @include text.truncate;
    }

    a {
      padding: var(--padding-6x) var(--padding-4x) var(--padding);
      font-size: var(--font-size-small);

      display: flex;
      justify-content: flex-start;
      align-items: center;

      span {
        @include text.truncate;
      }

      :global(svg) {
        vertical-align: bottom;
        margin-right: var(--padding);
      }
    }
  }
</style>