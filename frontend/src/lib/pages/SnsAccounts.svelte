<script lang="ts">
  import { TokenAmount } from "@dfinity/nns";
  import AccountsTitle from "../components/accounts/AccountsTitle.svelte";

  // TODO: Implement https://dfinity.atlassian.net/browse/GIX-993
  let totalAmountToken = TokenAmount.fromE8s({
    amount: BigInt(4_530_000_000),
    token: {
      symbol: "OC",
      name: "Open Chat",
    },
  });
</script>

<section data-tid="sns-accounts-body">
  <AccountsTitle balance={totalAmountToken} />
</section>
