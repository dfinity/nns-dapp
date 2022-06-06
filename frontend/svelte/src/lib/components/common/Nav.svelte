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
    position: fixed;
    top: 0;
    left: 0;
    width: 180px;
    bottom: 0;
    height: 100%;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    padding: 40px;
    margin: 0;
    border-radius: 0;
    box-shadow: -1px -1px 2px rgb(255 255 255 / 80%), 1px 1px 2px rgb(0 0 0 / 30%);

    background: var(--background);
    overflow: hidden;
  }

  a {
    color: var(--gray-50);

    font-size: var(--font-size-ultra-small);

    text-decoration: none;
    outline: none;

    margin-bottom: 40px;

    &.selected {
      font-weight: 700;
      color: #00A5FF;
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
