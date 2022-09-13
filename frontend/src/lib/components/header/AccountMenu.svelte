<script lang="ts">
  import Popover from "../ui/Popover.svelte";
  import IconAccount from "../../icons/IconAccount.svelte";
  import Logout from "./Logout.svelte";
  import { i18n } from "../../stores/i18n";
  import ThemeToggle from "./ThemeToggle.svelte";

  let visible = false;
  let button: HTMLButtonElement | undefined;
</script>

<button
  data-tid="account-menu"
  class="icon-only toggle"
  bind:this={button}
  on:click={() => (visible = !visible)}
  aria-label={$i18n.header.account_menu}
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
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/header";

  .info {
    @include overlay.content;

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    @include media.min-width(medium) {
      gap: var(--padding-0_5x);
    }
  }

  .toggle {
    justify-self: flex-end;

    @include header.button(--primary);
  }
</style>
