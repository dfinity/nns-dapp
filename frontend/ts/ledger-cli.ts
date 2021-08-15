/**
 * A CLI tool for testing the Ledger hardware wallet integration.
 *
 * As this matures, we may eventually spin it out to a proper tool for
 * people who prefer using CLI over the NNS dapp.
 */
import { Command } from "commander";
import { LedgerIdentity } from "./src/ledger/identity";
import { principalToAccountIdentifier } from "./src/canisters/converter";
import { AnonymousIdentity, HttpAgent } from "@dfinity/agent";
import ledgerBuilder from "./src/canisters/ledger/builder";

// Add polyfill for `window.fetch` for agent-js to work.
// @ts-ignore (no types are available)
import fetch from "node-fetch";
global.fetch = fetch;

const program = new Command();

// TODO: Make this configurable.
const HOST = "https://nnsdapp.dfinity.network";

async function getBalance() {
  const identity = await LedgerIdentity.create();
  const accountIdentifier = principalToAccountIdentifier(
    identity.getPrincipal()
  );

  console.log(`Fetching balance for account: ${accountIdentifier}`);

  const ledgerAgent = new HttpAgent({
    host: HOST,
    identity: new AnonymousIdentity(),
  });

  const ledgerService = ledgerBuilder(ledgerAgent);

  const balances = await ledgerService.getBalances({
    accounts: [accountIdentifier],
  });

  console.log(balances[accountIdentifier]);
}

async function main() {
  program
    .description("A CLI for the Ledger hardware wallet.")
    .addCommand(
      new Command("balance")
        .description("Fetch current balance.")
        .action(getBalance)
    );
  await program.parseAsync(process.argv);
}

main();
