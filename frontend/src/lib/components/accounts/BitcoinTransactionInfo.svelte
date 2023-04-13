<script lang="ts">
  import { i18n } from "$lib/stores/i18n";

  export let networkBtc = false;
</script>

{#if networkBtc}
  <p class="label info">{$i18n.accounts.transaction_time}</p>
  <p class="value no-margin">
    {$i18n.ckbtc.about_thirty_minutes}
  </p>

  <p class="label info">{$i18n.ckbtc.confirmations}</p>
  <p class="value no-margin">
    {$i18n.ckbtc.typically_twelve}
  </p>
{/if}

<style lang="scss">
  .info {
    margin: var(--padding) 0 0;
  }
</style>
