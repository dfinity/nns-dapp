<script lang="ts">
  import { routePath } from "../utils/route.utils";

  let currentPath: string = routePath();

  const routes: { path: string; label: string }[] = [
    { path: "/#/accounts", label: "ICP" },
    { path: "/#/neurons", label: "NEURONS" },
    { path: "/#/voting", label: "VOTING" },
    { path: "/#/canisters", label: "CANISTERS" },
  ];
</script>

<nav>
  {#each routes as { path, label }}
    <a href={path} class:selected={currentPath === path} aria-label={label}
      ><span>{label}</span></a
    >
  {/each}
</nav>

<style lang="scss">
  nav {
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
