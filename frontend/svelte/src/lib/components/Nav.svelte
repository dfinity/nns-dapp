<script lang="ts">
  import { baseHref, routeContext } from "../utils/route.utils";
  import { i18n } from "../stores/i18n";

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
      aria-label={label}><span>{$i18n.navigation[label]}</span></a
    >
  {/each}
</nav>

<style lang="scss">
  nav {
    position: absolute;
    top: var(--header-height);
    left: 0;
    right: 0;

    margin: var(--padding) calc(2 * var(--padding));

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

    font-weight: 700;

    text-decoration: none;

    &.selected {
      background: var(--blue-500);
      color: var(--blue-500-contrast);
    }

    &:not(.selected):hover {
      background: var(--background-tint);
    }

    @media (max-width: 576px) {
      font-size: var(--font-size-ultra-small);
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
