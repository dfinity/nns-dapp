<script lang="ts">
  import type { TransactionIconType } from "$lib/types/transaction";
  import {
    IconDown,
    IconErrorOutline,
    IconReimbursed,
    IconUp,
  } from "@dfinity/gix-components";

  export let type: TransactionIconType;
  export let isPending: boolean = false;
</script>

<div
  class="icon {type}"
  class:pending={isPending}
  data-tid="transaction-icon-component"
>
  {#if type === "sent"}
    <IconUp size="24px" />
  {:else if type === "received"}
    <IconDown size="24px" />
  {:else if type === "failed"}
    <IconErrorOutline size="24px" />
  {:else if type === "reimbursed"}
    <IconReimbursed size="24px" />
  {/if}
</div>

<style lang="scss">
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);

    width: var(--padding-6x);
    aspect-ratio: 1 / 1;

    &.received {
      background: var(--check-tint);
      color: var(--check);
    }

    &.sent {
      background: var(--background);
      color: var(--disable-contrast);
    }

    &.reimbursed,
    &.failed {
      color: var(--alert);
      background: var(--alert-tint);
    }

    &.pending {
      color: var(--pending-color);
      background: var(--pending-background);
    }
  }
</style>
