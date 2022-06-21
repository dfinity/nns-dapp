<script lang="ts">
  import Popover from "../ui/Popover.svelte";
  import IconAccount from "../../icons/IconAccount.svelte";
  import Logout from "./Logout.svelte";
  import { themeStore } from "../../stores/theme.store";
  import { i18n } from "../../stores/i18n";

  let visible = false;
  let button: HTMLButtonElement | undefined;
</script>

<button
  data-tid="account-menu"
  class={`icon-only toggle ${$themeStore}`}
  bind:this={button}
  on:click={() => (visible = !visible)}
  aria-label={$i18n.header.account_menu}
>
  <IconAccount />
</button>

<Popover bind:visible anchor={button} direction="rtl">
  <div class="info">
    <Logout />
  </div>
</Popover>

<style lang="scss">
  @use "../../themes/mixins/overlay";
  @use "../../themes/mixins/effect";
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/header";

  .theme-toggle {
    margin: 0;
  }

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
  }

  button.icon-only {
    @include header.button(--brand-picton-blue);
  }
</style>
