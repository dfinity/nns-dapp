<script lang="ts">
  import Popover from "../ui/Popover.svelte";
  import IconAccount from "../../icons/IconAccount.svelte";
  import Logout from "./Logout.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  let visible = false;
  let button: HTMLButtonElement | undefined;
</script>

<button
  bind:this={button}
  class="icon-only toggle"
  on:click={() => (visible = !visible)}
  aria-label="Account"
>
  <IconAccount />
</button>

<Popover bind:visible anchor={button} direction="rtl">
  <div class="info">
    <ThemeToggle />
    <Logout />
  </div>
</Popover>

<style lang="scss">
  @use "../../themes/mixins/overlay";
  @use "../../themes/mixins/effect";

  .theme-toggle {
    margin: 0;
  }

  .toggle {
    justify-self: end;

    width: fit-content;
    padding: var(--padding-1_5x);
    margin: 0 var(--padding-0_5x);

    :global(svg) {
      width: calc(3.5 * var(--padding));
      height: calc(3.5 * var(--padding));
    }

    @include effect.ripple-effect(--brand-picton-blue);
  }

  .info {
    @include overlay.content;

    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }
</style>
