<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import Tokens from "$lib/pages/Tokens.svelte";
  import SignInTokens from "$lib/pages/SignInTokens.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import { onMount } from "svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ICPToken, TokenAmount } from "@dfinity/utils";
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
  import type { Action } from "$lib/types/actions";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      goto(AppPath.Accounts);
    }
  });

  const data: UserTokenData[] = [
    {
      universeId: OWN_CANISTER_ID,
      title: "Internet Computer",
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
      logo: IC_LOGO_ROUNDED,
      actions: [UserTokenAction.GoToDetail],
    },
    {
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
      title: "CkBTC",
      balance: TokenAmount.fromE8s({
        amount: 1160000000n,
        token: { name: "CkBTC", symbol: "CkBTC" },
      }),
      logo: CKBTC_LOGO,
      actions: [UserTokenAction.Send, UserTokenAction.Receive],
    },
  ];

  const handleAction = ({ detail }: { detail: Action }) => {
    console.log("action", detail.type);
    console.log(detail.data);
  };
</script>

<TestIdWrapper testId="tokens-route-component">
  {#if $authSignedInStore}
    <Tokens userTokensData={data} on:nnsAction={handleAction} />
  {:else}
    <SignInTokens />
  {/if}
</TestIdWrapper>
