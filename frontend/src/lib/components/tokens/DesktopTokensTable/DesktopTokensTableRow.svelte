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
  import TokenBalance from "../TokenBalance.svelte";

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
  data-tid="desktop-tokens-table-row-component"
>
  <div role="cell" class="universe-data">
    <Logo
      src={userTokenData.logo}
      alt={userTokenData.title}
      size="medium"
      framed
    />
    <span>{userTokenData.title}</span>
  </div>
  <div role="cell" class="mobile-row left">
    <span class="cell-key">Balance</span>
    <TokenBalance {userTokenData} />
  </div>
  <div role="cell" class="actions">
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

  div[role="row"] {
    @include interaction.tappable;

    display: grid;
    grid-template-columns: 1fr max-content;
    grid-template-rows: auto;
    grid-template-areas: "universe-data actions" "balance balance";
    row-gap: var(--padding-2x);

    @include media.min-width(medium) {
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      grid-template-areas: auto;
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

    &.universe-data {
      grid-area: universe-data;

      @include media.min-width(medium) {
        grid-area: auto;
      }
    }

    &.actions {
      grid-area: actions;

      @include media.min-width(medium) {
        grid-area: auto;
      }
    }

    &.mobile-row {
      grid-area: balance;

      display: flex;
      justify-content: space-between;

      @include media.min-width(medium) {
        grid-area: auto;

        &.left {
          justify-content: flex-end;
        }
      }
    }

    .cell-key {
      display: block;

      @include media.min-width(medium) {
        display: none;
      }
    }
  }

  .universe-data {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .actions {
    justify-content: flex-end;

    :global(svg) {
      color: var(--primary);
    }
  }
</style>
