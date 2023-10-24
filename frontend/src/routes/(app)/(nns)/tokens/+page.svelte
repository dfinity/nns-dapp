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
  import { UserTokenActions, type UserTokenData } from "$lib/types/tokens-page";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      goto(AppPath.Accounts);
    }
  });

  const data = [
    {
      canisterId: OWN_CANISTER_ID,
      title: "Internet Computer",
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
      logo: IC_LOGO_ROUNDED,
      actions: [UserTokenActions.GoToDetail],
    },
    {
      canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      title: "CkBTC",
      balance: TokenAmount.fromE8s({
        amount: 1160000000n,
        token: { name: "CkBTC", symbol: "CkBTC" },
      }),
      logo: CKBTC_LOGO,
      actions: [UserTokenActions.Send, UserTokenActions.Receive],
    },
  ];

  const goToDetail = ({ detail }: { detail: UserTokenData }) => {
    console.log("go to detail");
    console.log(detail);
  };

  const openSendModal = ({ detail }: { detail: UserTokenData }) => {
    console.log("open send modal");
    console.log(detail);
  };

  const openReceiveModal = ({ detail }: { detail: UserTokenData }) => {
    console.log("open receive modal");
    console.log(detail);
  };
</script>

<TestIdWrapper testId="tokens-route-component">
  {#if $authSignedInStore}
    <Tokens
      tokens={data}
      on:nnsGoToDetail={goToDetail}
      on:nnsRowClick={goToDetail}
      on:nnsSend={openSendModal}
      on:nnsReceive={openReceiveModal}
    />
  {:else}
    <SignInTokens />
  {/if}
</TestIdWrapper>
