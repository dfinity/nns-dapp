<script lang="ts">
  import { TokenAmount } from "@dfinity/nns";
  import AccountsTitle from "../components/accounts/AccountsTitle.svelte";

  // TODO: Implement https://dfinity.atlassian.net/browse/GIX-993
  let totalAmountToken = TokenAmount.fromE8s({
    amount: BigInt(0),
    token: {
      symbol: "test",
      name: "todo",
    },
  });
</script>

<section data-tid="sns-accounts-body">
  <AccountsTitle balance={totalAmountToken} />
</section>
