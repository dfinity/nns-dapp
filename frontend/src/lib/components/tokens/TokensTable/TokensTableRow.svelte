<script lang="ts">
  import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
  import {
    SvelteComponent,
    createEventDispatcher,
    type ComponentType,
  } from "svelte";
  import Logo from "../../ui/Logo.svelte";
  import GoToDetailButton from "./actions/GoToDetailButton.svelte";
  import ReceiveButton from "./actions/ReceiveButton.svelte";
  import SendButton from "./actions/SendButton.svelte";
  import { ActionType } from "$lib/types/actions";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";

  export let userTokenData: UserTokenData;
  export let index: number;

  const dispatcher = createEventDispatcher();

  const actionMapper: Record<
    UserTokenAction,
    ComponentType<SvelteComponent<{ userToken: UserTokenData }>>
  > = {
    [UserTokenAction.GoToDetail]: GoToDetailButton,
    [UserTokenAction.Receive]: ReceiveButton,
    [UserTokenAction.Send]: SendButton,
  };

  const handleClick = () =>
    dispatcher("nnsAction", {
      type: ActionType.GoToTokenDetail,
      data: userTokenData,
    });
</script>

<div
  role="row"
  tabindex={index + 1}
  on:keypress={handleClick}
  on:click={handleClick}
  data-tid="tokens-table-row-component"
>
  <div role="cell" class="title-cell">
    <div class="title">
      <Logo
        src={userTokenData.logo}
        alt={userTokenData.title}
        size="medium"
        framed
      />
      <span data-tid="project-name">{userTokenData.title}</span>
    </div>
    <div class="title-actions actions mobile-only">
      {#each userTokenData.actions as action}
        <svelte:component
          this={actionMapper[action]}
          userToken={userTokenData}
          on:nnsAction
        />
      {/each}
    </div>
  </div>
  <div role="cell" class="mobile-row-cell left-cell">
    <span class="mobile-only">Balance</span>
    {#if userTokenData.balance instanceof UnavailableTokenAmount}
      <span data-tid="token-value-label"
        >{`-/- ${userTokenData.balance.token.symbol}`}</span
      >
    {:else}
      <AmountDisplay singleLine amount={userTokenData.balance} />
    {/if}
  </div>
  <div role="cell" class="actions-cell actions">
    {#each userTokenData.actions as action}
      <svelte:component
        this={actionMapper[action]}
        userToken={userTokenData}
        on:nnsAction
      />
    {/each}
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../../themes/mixins/grid-table";

  div[role="row"] {
    @include interaction.tappable;

    // If we use grid-template-areas, we need to specify all the areas.
    // That makes it hard to have dynamic columns.
    // Instead, we duplicate the actions. Once as the last cell, another within the title cell.
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(medium) {
      @include grid-table.row;
      row-gap: 0;
    }

    padding: var(--padding-2x);

    background-color: var(--table-row-background);

    @include media.min-width(medium) {
      grid-template-rows: 1fr;
    }

    &:hover {
      background-color: var(--table-row-background-hover);
    }
  }

  div[role="cell"] {
    display: flex;
    align-items: center;
    gap: var(--padding);

    &.title-cell {
      justify-content: space-between;

      // Title actions are displayed only on mobile.
      // On desktop, the actions are in the last cell.
      .title-actions {
        display: block;

        @include media.min-width(medium) {
          display: none;
        }
      }
    }

    // Actions cell is displayed only on desktop.
    // On mobile, the actions are in the first cell.
    &.actions-cell {
      display: none;
      justify-content: flex-end;

      @include media.min-width(medium) {
        display: flex;
      }
    }

    &.mobile-row-cell {
      display: flex;
      justify-content: space-between;

      @include media.min-width(medium) {
        &.left-cell {
          justify-content: flex-end;
        }
      }
    }
  }

  .title {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .actions {
    :global(svg) {
      color: var(--primary);
    }
  }

  .mobile-only {
    display: block;

    @include media.min-width(medium) {
      display: none;
    }
  }
</style>
