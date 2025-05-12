<script lang="ts" module>
  // This is a list of useful functions to help people find and recover tokens sent to ICRC subaccounts.
  // ICRC subaccounts are not officially supported thus this alternative solution.
  type WindowWithExperimentalFunction = Window & {
    // List subaccounts for the current project.
    // In the devtools console, run: __experimentalGetIcrcSubaccounts()
    __experimentalGetIcrcSubaccounts: () => Promise<void>;

    // Get balance for a given subaccount.
    // In the devtools console, run: __experimentalGetIcrcSubaccountBalance(subaccountId)
    __experimentalGetIcrcSubaccountBalance: (
      subaccount: string
    ) => Promise<void>;

    // Send tokens from the given subaccount to the main account.
    __experimentaRecoverIcrcBalanceFromSubaccount: (
      subaccount: string
    ) => Promise<void>;
  };
</script>

<script lang="ts">
  import { listSubaccounts } from "$lib/api/icrc-index.api";
  import { icrcTransfer, queryIcrcBalance } from "$lib/api/icrc-ledger.api";
  import { authStore } from "$lib/stores/auth.store";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import type { IcrcTokenMetadata } from "@dfinity/ledger-icrc";
  import type { Principal } from "@dfinity/principal";
  import { isNullish } from "@dfinity/utils";

  type Props = {
    indexCanisterId: Principal;
    ledgerCanisterId: Principal;
    token: IcrcTokenMetadata;
  };

  const { indexCanisterId, ledgerCanisterId, token }: Props = $props();
  const identity = $derived($authStore.identity);

  $effect(() => {
    const experimentalWindow =
      window as unknown as WindowWithExperimentalFunction;

    experimentalWindow.__experimentalGetIcrcSubaccounts = async () => {
      if (isNullish(identity)) {
        console.error("No identity found. You need to login first.");
        return;
      }

      try {
        const data = await listSubaccounts({
          identity,
          indexCanisterId,
        });
        console.log(`List of subaccounts: ${data.map(subaccountToHexString)}`);
      } catch (error) {
        console.error("Failed to fetch subaccounts:", error);
      }
    };

    experimentalWindow.__experimentalGetIcrcSubaccountBalance = async (
      subaccount: string
    ) => {
      if (isNullish(identity)) {
        console.error("No identity found. You need to login first.");
        return;
      }

      try {
        const data = await queryIcrcBalance({
          identity,
          certified: false,
          canisterId: ledgerCanisterId,
          account: {
            owner: identity.getPrincipal(),
            subaccount: hexStringToBytes(subaccount),
          },
        });
        console.log(`Balance of subaccount ${subaccount} is ${data}`);
      } catch (error) {
        console.error("Failed to fetch subaccount balance:", error);
      }
    };

    experimentalWindow.__experimentaRecoverIcrcBalanceFromSubaccount = async (
      subaccount
    ) => {
      if (isNullish(identity)) {
        console.error("No identity found. You need to login first.");
        return;
      }

      try {
        const balance = await queryIcrcBalance({
          identity,
          certified: false,
          canisterId: ledgerCanisterId,
          account: {
            owner: identity.getPrincipal(),
            subaccount: hexStringToBytes(subaccount),
          },
        });

        console.log(`Balance of subaccount ${subaccount} is ${balance}`);

        console.log(
          `Sending balance(${balance}) minus the transaction fee (${token.fee})to main account...`
        );
        const amount = BigInt(balance) - token.fee;

        const a = await icrcTransfer({
          canisterId: ledgerCanisterId,
          identity,
          to: {
            owner: identity.getPrincipal(),
          },
          amount,
          fromSubAccount: hexStringToBytes(subaccount),
          fee: token.fee,
        });

        console.log(a);
      } catch (error) {
        console.error("Failed to do something:", error);
      }
    };

    experimentalWindow.__temporalSendTokens = async () => {
      if (isNullish(identity)) return;

      try {
        const a = await icrcTransfer({
          canisterId: ledgerCanisterId,
          identity,
          to: {
            owner: identity.getPrincipal(),
            subaccount: hexStringToBytes(
              "bdf5780ae7b5a6590aaa3d9080a16b436b44ca2162f6f9ec20f81a5bc020f2d1"
            ),
          },
          // This one should be defined by the total amount in the account
          amount: 1_000_000_000n,
          // I need to get this one right from the project info
          fee: token.fee,
        });
        console.log(a);
      } catch (error) {
        console.error("Failed to do something:", error);
      }
    };
  });
</script>
