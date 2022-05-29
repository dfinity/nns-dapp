<script lang="ts">
  import { baseHref, routeContext } from "../../utils/route.utils";
  import { i18n } from "../../stores/i18n";

  let currentContext: string = routeContext();

  const baseUrl: string = baseHref();

  const routes: { context: string; label: string }[] = [
    { context: "accounts", label: "icp" },
    { context: "neurons", label: "neurons" },
    { context: "proposals", label: "voting" },
    { context: "canisters", label: "canisters" },
  ];
</script>

<nav>
  {#each routes as { context, label }}
    <a
      href={`${baseUrl}#/${context}`}
      class:selected={currentContext === context}
      data-tid={`tab-to-${context}`}
      aria-label={label}><span>{$i18n.navigation[label]}</span></a
    >
  {/each}
</nav>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  nav {
    position: absolute;
    top: calc(var(--header-offset, 0px) + var(--header-height));
    left: 0;
    right: 0;

    margin: var(--padding) var(--padding-2x);

    height: var(--nav-height);

    display: grid;
    grid-template-columns: repeat(4, 25%);

    justify-content: center;
    align-items: center;

    background: var(--background);

    border-radius: var(--border-radius);
    overflow: hidden;
  }

  a {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    color: var(--gray-400);

    font-size: var(--font-size-ultra-small);
    font-weight: 700;

    text-decoration: none;
    outline: none;

    &.selected {
      background: var(--blue-500);
      color: var(--blue-500-contrast);

      &:focus,
      &:hover {
        background: var(--blue-400);
      }
    }

    &:not(.selected):focus,
    &:not(.selected):hover {
      background: var(--background-tint);
    }

    @include media.min-width(small) {
      font-size: var(--font-size-h4);
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
