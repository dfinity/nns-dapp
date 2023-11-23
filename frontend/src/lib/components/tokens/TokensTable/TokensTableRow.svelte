<script lang="ts">
  import {
    UserTokenAction,
    type UserTokenData,
    type UserTokenLoading,
  } from "$lib/types/tokens-page";
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
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner } from "@dfinity/gix-components";
  import { isUserTokenData } from "$lib/utils/user-token.utils";

  export let userTokenData: UserTokenData | UserTokenLoading;
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

  let userToken: UserTokenData | undefined;
  $: userToken = isUserTokenData(userTokenData) ? userTokenData : undefined;

  const handleClick = () => {
    if (nonNullish(userToken)) {
      // Actions can only be dispatched with `UserTokenData`
      dispatcher("nnsAction", {
        type: ActionType.GoToTokenDetail,
        data: userToken,
      });
    }
  };
</script>

<div
  role="row"
  tabindex={index + 1}
  on:keypress={handleClick}
  on:click={handleClick}
  data-tid="tokens-table-row-component"
>
  <div role="cell" class="title-cell">
    <div class="title-logo-wrapper">
      <Logo
        src={userTokenData.logo}
        alt={userTokenData.title}
        size="medium"
        framed
      />
      <div class="title-wrapper">
        <span data-tid="project-name">{userTokenData.title}</span>
        {#if nonNullish(userTokenData.subtitle)}
          <span data-tid="project-subtitle" class="description"
            >{userTokenData.subtitle}</span
          >
        {/if}
      </div>
    </div>
    <div class="title-actions actions mobile-only">
      {#if nonNullish(userToken)}
        {#each userToken.actions as action}
          <svelte:component
            this={actionMapper[action]}
            {userToken}
            on:nnsAction
          />
        {/each}
      {/if}
    </div>
  </div>
  <div role="cell" class="mobile-row-cell left-cell">
    <span class="mobile-only">{$i18n.tokens.balance_header}</span>
    {#if userTokenData.balance instanceof UnavailableTokenAmount}
      <span data-tid="token-value-label"
        >{`-/- ${userTokenData.balance.token.symbol}`}</span
      >
    {:else if userTokenData.balance === "loading"}
      <span data-tid="token-value-label" class="balance-spinner"
        ><Spinner inline size="tiny" /></span
      >
    {:else}
      <AmountDisplay singleLine amount={userTokenData.balance} />
    {/if}
  </div>
  <div role="cell" class="actions-cell actions">
    {#if nonNullish(userToken)}
      {#each userToken.actions as action}
        <svelte:component
          this={actionMapper[action]}
          {userToken}
          on:nnsAction
        />
      {/each}
    {/if}
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

  .title-logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
  }

  .balance-spinner {
    display: flex;
    align-items: center;
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
