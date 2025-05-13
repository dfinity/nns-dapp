<script lang="ts" module>
  // This is a list of useful functions to help people find and recover tokens sent to ICRC subaccounts.
  // ICRC subaccounts are not officially supported thus this alternative solution.
  // They require the user to be logged in to the NNS dapp and in a project's wallet page.
  type WindowWithExperimentalFunction = Window & {
    // Display help information for available commands
    __experimentalIcrcHelp: () => void;

    // List subaccounts for the current project.
    // In the devtools console, run: __experimentalGetIcrcSubaccounts()
    __experimentalGetIcrcSubaccounts: () => Promise<void>;

    // Get balance for a given subaccount.
    // In the devtools console, run: __experimentalGetIcrcSubaccountBalance(subaccountId)
    __experimentalGetIcrcSubaccountBalance: (
      subaccount: string
    ) => Promise<void>;

    // Transfer all tokens from a given subaccount to the main account.
    // In the devtools console, run: __experimentaRecoverIcrcBalanceFromSubaccount(subaccountId)
    __experimentalRecoverIcrcBalanceFromSubaccount: (
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

    experimentalWindow.__experimentalIcrcHelp = () => {
      console.log(`
=== ICRC Subaccount Helper Tools ===

Available commands:

__experimentalGetIcrcSubaccounts()
  - Lists all subaccounts for the current user in this project

__experimentalGetIcrcSubaccountBalance("<accountId>")
  - Shows balance for the specified subaccount

__experimentalRecoverIcrcBalanceFromSubaccount("<accountId>")
  - Transfers all tokens from the specified subaccount to your main account

Note: You must be logged in to use these commands.
      `);
    };

    experimentalWindow.__experimentalGetIcrcSubaccounts = async () => {
      if (isNullish(identity)) {
        console.error("❌ No identity found. You need to login first.");
        return;
      }

      try {
        console.log("🔍 Fetching subaccounts...");

        const data = await listSubaccounts({
          identity,
          indexCanisterId,
        });

        if (data.length === 0) {
          console.log("ℹ️ No subaccounts found for this user.");
          return;
        }

        console.log("✅ Found subaccounts:");
        data.map(subaccountToHexString).forEach((subaccount, index) => {
          console.log(`   ${index + 1}: ${subaccount}`);
        });
      } catch (error) {
        console.error("❌ Failed to fetch subaccounts:", error);
      }
    };

    experimentalWindow.__experimentalGetIcrcSubaccountBalance = async (
      subaccount: string
    ) => {
      if (isNullish(identity)) {
        console.error("❌ No identity found. You need to login first.");
        return;
      }

      if (isNullish(subaccount)) {
        console.error("❌ Subaccount was not provided.");
        return;
      }

      try {
        console.log(`🔍 Checking balance for subaccount: ${subaccount}...`);
        const account = {
          owner: identity.getPrincipal(),
          subaccount: hexStringToBytes(subaccount),
        };

        const balance = await queryIcrcBalance({
          identity,
          certified: true,
          canisterId: ledgerCanisterId,
          account,
        });

        console.log(`💰 Balance: ${balance} ${token.symbol}`);
      } catch (error) {
        console.error(
          `❌ Failed to fetch balance for subaccount ${subaccount}:`,
          error
        );
      }
    };

    experimentalWindow.__experimentalRecoverIcrcBalanceFromSubaccount = async (
      subaccount
    ) => {
      if (isNullish(identity)) {
        console.error("❌ No identity found. You need to login first.");
        return;
      }

      if (isNullish(subaccount)) {
        console.error("❌ Subaccount was not provided.");
        return;
      }

      try {
        console.log(`🔍 Checking balance for subaccount: ${subaccount}...`);
        const balance = await queryIcrcBalance({
          identity,
          certified: true,
          canisterId: ledgerCanisterId,
          account: {
            owner: identity.getPrincipal(),
            subaccount: hexStringToBytes(subaccount),
          },
        });

        console.log(`💰 Balance: ${balance} ${token.symbol}`);

        if (BigInt(balance) <= token.fee) {
          console.error(
            `❌ Insufficient balance to cover the transfer fee (${token.fee} ${token.symbol}).`
          );
          return;
        }

        const amount = BigInt(balance) - token.fee;
        console.log(
          `⏳ Transferring ${amount} ${token.symbol} to main account...`
        );

        const result = await icrcTransfer({
          canisterId: ledgerCanisterId,
          identity,
          to: {
            owner: identity.getPrincipal(),
          },
          amount,
          fromSubAccount: hexStringToBytes(subaccount),
          fee: token.fee,
        });

        console.log(`✅ Transfer successful! Transaction ID: ${result}`);
      } catch (error) {
        console.error(`❌ Transfer failed:`, error);
      }
    };

    // Testing function used only for development.
    // Uncomment it and run it as the other functions to send tokens to a given subaccount
    //
    // experimentalWindow.__testSendTokensToSubaccount = async (
    //   subaccount: string
    // ) => {
    //   if (isNullish(identity)) {
    //     console.error("❌ No identity found. You need to login first.");
    //     return;
    //   }

    //   try {
    //     console.log(
    //       "⚠️ Warning: This is a development function for testing purposes"
    //     );

    //     const result = await icrcTransfer({
    //       canisterId: ledgerCanisterId,
    //       identity,
    //       to: {
    //         owner: identity.getPrincipal(),
    //         subaccount: hexStringToBytes(subaccount),
    //       },
    //       amount: 1_000_000_000n,
    //       fee: token.fee,
    //     });

    //     console.log(`✅ Test transfer complete:`, result);
    //   } catch (error) {
    //     console.error("❌ Test transfer failed:", error);
    //   }
    // };
  });
</script>
