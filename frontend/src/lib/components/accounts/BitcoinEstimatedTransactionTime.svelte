<script lang="ts">
  import { i18n } from "$lib/stores/i18n";

  export let networkBtc = false;
</script>

{#if networkBtc}
  <p class="label receive-time">{$i18n.accounts.transaction_time}</p>
  <p class="value no-margin">
    {$i18n.ckbtc.about_thirty_minutes}
  </p>
{/if}

<style lang="scss">
  .receive-time {
    margin: var(--padding) 0 0;
  }
</style>
