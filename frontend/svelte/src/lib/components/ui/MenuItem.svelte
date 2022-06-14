<script lang="ts">
  import { baseHref, routeContext } from "../../utils/route.utils";
  import { i18n } from "../../stores/i18n";
  import type { SvelteComponent } from "svelte";

  const baseUrl: string = baseHref();
  let currentContext: string = routeContext();

  export let context: string;
  export let label: string;
  export let icon: typeof SvelteComponent;
</script>

<a
  role="menuitem"
  href={`${baseUrl}#/${context}`}
  class:selected={currentContext === context}
  data-tid={`tab-to-${context}`}
  aria-label={label}
>
  <svelte:component this={icon} />
  <span>{$i18n.navigation[label]}</span>
</a>

<style lang="scss">
  a {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    font-size: var(--font-size-h4);
    font-weight: 700;

    text-decoration: none;
    outline: none;

    padding: var(--padding-2x);

    &.selected {
      background: var(--blue-500);
      color: var(--blue-500-contrast);

      &:focus,
      &:hover {
        background: var(--blue-500-tint);
      }
    }

    &:not(.selected):focus,
    &:not(.selected):hover {
      background: var(--background-tint);
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    /** 24px is the size of the svg **/
    max-width: calc(100% - 24px - var(--padding));

    margin: 0 0 0 var(--padding);
  }
</style>
