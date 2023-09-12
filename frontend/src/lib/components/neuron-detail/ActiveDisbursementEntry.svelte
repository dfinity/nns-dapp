<script lang="ts">
  import { IconClockNoFill, KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let dateTime: string;
  export let destination: string;
  export let amount: string;
</script>

<div class="container" data-tid="active-disbursement-entry-component">
  <span class="icon">
    <IconClockNoFill size="20px" />
  </span>
  <div class="content description">
    <KeyValuePair>
      <span slot="key"
        >{$i18n.neuron_detail.active_maturity_disbursements_amount}</span
      >
      <span slot="value" class="value" data-tid="maturity">{amount}</span>
    </KeyValuePair>
    <KeyValuePair>
      <span slot="key" class="description"
        >{$i18n.neuron_detail.view_active_disbursements_to}<span
          data-tid="destination">{destination}</span
        ></span
      >
      <span slot="value" class="description timestamp" data-tid="timestamp"
        >{dateTime}</span
      >
    </KeyValuePair>
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    gap: var(--padding-1_5x);
  }

  .icon {
    width: var(--padding-6x);
    height: 100%;
    aspect-ratio: 1/1;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
    background: var(--content-background);

    color: var(--disable-contrast);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    flex-grow: 1;
  }

  .description {
    font-size: var(--font-size-small);
  }

  .timestamp {
    white-space: pre;
  }

  .value {
    grid-column: 2;
  }
</style>
