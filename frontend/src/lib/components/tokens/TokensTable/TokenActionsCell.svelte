<script lang="ts">
  import GoToDashboardButton from "$lib/components/tokens/TokensTable/actions/GoToDashboardButton.svelte";
  import GoToDetailIcon from "$lib/components/tokens/TokensTable/actions/GoToDetailIcon.svelte";
  import ReceiveButton from "$lib/components/tokens/TokensTable/actions/ReceiveButton.svelte";
  import RemoveButton from "$lib/components/tokens/TokensTable/actions/RemoveButton.svelte";
  import SendButton from "$lib/components/tokens/TokensTable/actions/SendButton.svelte";
  import {
    UserTokenAction,
    type UserTokenData,
    type UserTokenFailed,
    type UserTokenLoading,
  } from "$lib/types/tokens-page";
  import { isUserTokenLoading } from "$lib/utils/user-token.utils";
  import { nonNullish } from "@dfinity/utils";
  import type { ComponentType, Component } from "svelte";

  export let rowData: UserTokenData | UserTokenLoading | UserTokenFailed;

  const actionMapper: Record<
    UserTokenAction,
    ComponentType<Component<{ userToken: UserTokenData | UserTokenFailed }>>
  > = {
    [UserTokenAction.GoToDetail]: GoToDetailIcon,
    [UserTokenAction.Receive]: ReceiveButton,
    [UserTokenAction.Send]: SendButton,
    [UserTokenAction.GoToDashboard]: GoToDashboardButton,
    [UserTokenAction.Remove]: RemoveButton,
  };

  let userToken: UserTokenData | UserTokenFailed | undefined;
  $: userToken = isUserTokenLoading(rowData) ? undefined : rowData;
</script>

{#if nonNullish(userToken)}
  <div class="container">
    {#each userToken.actions as action}
      <svelte:component this={actionMapper[action]} {userToken} on:nnsAction />
    {/each}
  </div>
{/if}

<style lang="scss">
  .container {
    color: var(--primary);
    display: flex;
    height: 28px;
    align-items: center;
    gap: var(--padding);
  }
</style>
