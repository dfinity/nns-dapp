<script lang="ts">
  import Popover from "$lib/components/ui/Popover.svelte";
  import { IconAccount } from "@dfinity/gix-components";
  import Logout from "./Logout.svelte";
  import { i18n } from "$lib/stores/i18n";
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
    gap: var(--padding-3x);
  }

  .toggle {
    justify-self: flex-end;

    @include header.button(--brand-sea-buckthorn);
  }
</style>
