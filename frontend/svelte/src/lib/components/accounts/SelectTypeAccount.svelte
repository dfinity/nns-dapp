<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";

  const dispatcher = createEventDispatcher();
  const selectNewAccount = () => {
    dispatcher("nnsSelect", "newAccount");
  };
</script>

<div class="wizard-wrapper">
  <div class="card-item" role="button" on:click={selectNewAccount}>
    <h4>{$i18n.accounts.new_linked_title}</h4>
    <span>{$i18n.accounts.new_linked_subtitle}</span>
  </div>
  <!-- TODO: Select New Hardware Wallet -->
  <div class="card-item" role="button" on:click={selectNewAccount}>
    <h4>{$i18n.accounts.attach_hardware_title}</h4>
    <span>{$i18n.accounts.attach_hardware_subtitle}</span>
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/interaction";

  .card-item {
    padding: calc(4 * var(--padding));
    margin: 0 calc(2 * var(--padding));
    border-radius: var(--border-radius);

    @include interaction.tappable;

    &:hover {
      background: var(--background-hover);
    }

    h4 {
      line-height: 1;
      margin-bottom: var(--padding);
    }

    span {
      color: var(--gray-200);
    }
  }
</style>
