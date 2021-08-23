/**
 * A CLI tool for testing the Ledger hardware wallet integration.
 *
 * As this matures, we may eventually spin it out to a proper tool for
 * people who prefer using CLI over the NNS dapp.
 */
import { Command } from "commander";
import { LedgerIdentity } from "./src/ledger/identity";
import { principalToAccountIdentifier } from "./src/canisters/converter";
import governanceBuilder from "./src/canisters/governance/builder";
import GovernanceService from "./src/canisters/governance/model";
import LedgerService from "./src/canisters/ledger/model";
import { AnonymousIdentity, HttpAgent, SignIdentity } from "@dfinity/agent";
import ledgerBuilder from "./src/canisters/ledger/builder";
import { AccountIdentifier, E8s } from "./src/canisters/common/types";
import HardwareWalletApi from "./src/HardwareWalletApi";

// Add polyfill for `window.fetch` for agent-js to work.
// @ts-ignore (no types are available)
import fetch from "node-fetch";
global.fetch = fetch;

const program = new Command();

// TODO: Make this configurable.
const HOST = "https://nnsdapp.dfinity.network";

async function getGovernanceService(
  identity: SignIdentity
): Promise<GovernanceService> {
  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  // TODO: only fetch rootkey on testnet.
  await agent.fetchRootKey();

  return governanceBuilder(agent, identity);
}

async function getLedgerService(
  identity: SignIdentity
): Promise<LedgerService> {
  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  // TODO: only fetch rootkey on testnet.
  await agent.fetchRootKey();

  return ledgerBuilder(agent);
}

/**
 * Fetches the balance of the main account on the wallet.
 */
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

/**
 * Send ICP to another address.
 *
 * @param to The account identifier in hex.
 * @param amount Amount to send in e8s.
 */
async function sendICP(to: AccountIdentifier, amount: string) {
  const identity = await LedgerIdentity.create();
  const ledger = await getLedgerService(identity);
  const response = await ledger.sendICPTs({
    to: to,
    amount: BigInt(amount),
    memo: BigInt(0),
  });

  console.log(response);
}

/**
 * Stakes a new neuron.
 *
 * @param amount Amount to stake in e8s.
 */
async function stakeNeuron(amount: E8s) {
  const identity = await LedgerIdentity.create();
  const hwApi = await HardwareWalletApi.create(identity);
  const neuronId = await hwApi.createNeuron(amount);
  console.log(`Staked neuron with ID: ${neuronId}`);
}

async function addHotkey(neuronId: string, principal: string) {
  const identity = await LedgerIdentity.create();
  const governance = await getGovernanceService(identity);

  const response = await governance.addHotKey({
    neuronId: BigInt(neuronId),
    principal: principal,
  });
  console.log(response);
}

async function increaseDissolveDelay(
  neuronId: string,
  additionalDelaySeconds: string
) {
  const identity = await LedgerIdentity.create();
  const governance = await getGovernanceService(identity);

  console.log(
    await governance.increaseDissolveDelay({
      neuronId: BigInt(neuronId),
      additionalDissolveDelaySeconds: Number.parseInt(additionalDelaySeconds),
    })
  );
}

async function main() {
  program
    .description("A CLI for the Ledger hardware wallet.")
    .addCommand(
      new Command("balance")
        .description("Fetch current balance.")
        .action(getBalance)
    )
    .addCommand(
      new Command("send-icp")
        .requiredOption("--to <account-identifier>")
        .requiredOption("--amount <amount>", "Amount to transfer in e8s.")
        .action((args) => sendICP(args.to, args.amount))
    )
    .addCommand(
      new Command("stake-neuron")
        .description("Stake a new neuron.")
        .requiredOption("--amount <amount>", "Amount to stake in e8s.")
        .action((args) => stakeNeuron(args.amount))
    )
    .addCommand(
      new Command("increase-dissolve-delay")
        .requiredOption("--neuron-id <neuron-id>", "description")
        .requiredOption("--additional-delay-secs <additional-delay-seconds>")
        .action((args) =>
          increaseDissolveDelay(args.neuronId, args.additionalDelaySecs)
        )
    )
    .addCommand(
      new Command("add-hotkey")
        .requiredOption("--neuron-id <neuron-id>")
        .requiredOption("--principal <principal>")
        .action((args) => addHotkey(args.neuronId, args.principal))
    );

  await program.parseAsync(process.argv);
}

main();
