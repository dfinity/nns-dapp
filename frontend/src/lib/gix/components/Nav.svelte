<div><slot name="title" /></div>

<nav>
  <slot />
</nav>

<style lang="scss">
  @use "../styles/mixins/layout";
  @use "../styles/mixins/media";

  div {
    display: var(--nav-component-title-display);
    padding: var(--padding-2x) var(--padding-2x) 0;
    margin: 0;

    @include media.min-width(large) {
      // Observed aligned value in NNS-dapp
      padding: var(--nav-padding-top) var(--padding-4x)
        calc(var(--padding-2x) - 3px);
      --nav-padding-top: var(--padding-4x);
    }

    @include media.min-width(large) {
      --nav-padding-top: var(--padding-2x);
    }
  }

  nav {
    @include layout.main;

    margin: 0;
    padding: 0;
    @include media.min-width(medium) {
      padding: 0 var(--padding-2x);
    }
  }
</style>
