<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";

  const dispatcher = createEventDispatcher();
  const selectNewAccount = () => {
    dispatcher("nnsSelect", "newAccount");
  };
</script>

<section>
  <div class="card-item" role="button" on:click={selectNewAccount}>
    <h4>{$i18n.accounts.new_linked_title}</h4>
    <p>{$i18n.accounts.new_linked_subtitle}</p>
  </div>
  <!-- TODO: Select New Hardware Wallet -->
  <div class="card-item" role="button" on:click={selectNewAccount}>
    <h4>{$i18n.accounts.attach_hardware_title}</h4>
    <p>{$i18n.accounts.attach_hardware_subtitle}</p>
  </div>
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: var(--padding);

    box-sizing: border-box;
    height: 100%;

    padding: calc(10 * var(--padding)) calc(5 * var(--padding));
  }

  .card-item {
    padding: calc(4 * var(--padding));
    border-radius: var(--border-radius);

    cursor: pointer;

    &:hover {
      background-color: var(--blue-700);
    }

    h4 {
      line-height: 1;
      margin-bottom: var(--padding);
    }

    p {
      font-size: var(--font-size-small);
    }
  }
</style>
