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
import {
  AccountIdentifier,
  E8s,
  PrincipalString,
} from "./src/canisters/common/types";
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

async function removeHotkey(neuronId: string, principal: string) {
  const identity = await LedgerIdentity.create();
  const governance = await getGovernanceService(identity);

  const response = await governance.removeHotKey({
    neuronId: BigInt(neuronId),
    principal: principal,
  });
  console.log(response);
}

async function disburseNeuron(
  neuronId: string,
  to?: AccountIdentifier,
  amount?: string,
  subaccount?: string
) {
  const identity = await getLedgerIdentity(subaccount);
  const governance = await getGovernanceService(identity);

  const response = await governance.disburse({
    neuronId: BigInt(neuronId),
    toAccountId: to,
    amount: amount ? BigInt(amount) : undefined,
  });
  console.log(response);
}

async function spawnNeuron(neuronId: string, controller?: PrincipalString) {
  const identity = await getLedgerIdentity();
  const governance = await getGovernanceService(identity);

  const response = await governance.spawn({
    neuronId: BigInt(neuronId),
    newController: controller ? controller : null,
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

async function startDissolving(neuronId: string) {
  const identity = await LedgerIdentity.create();
  const response = await (
    await getGovernanceService(identity)
  ).startDissolving({
    neuronId: BigInt(neuronId),
  });
  console.log(response);
}

async function stopDissolving(neuronId: string) {
  const identity = await LedgerIdentity.create();
  const response = await (
    await getGovernanceService(identity)
  ).stopDissolving({
    neuronId: BigInt(neuronId),
  });
  console.log(response);
}

async function getLedgerIdentity(subaccount?: string): Promise<LedgerIdentity> {
  const subaccountId = subaccount ? Number.parseInt(subaccount) : 0;
  return await LedgerIdentity.create(`m/44'/223'/0'/0/${subaccountId}`);
}

async function listNeurons() {
  const identity = await LedgerIdentity.create();
  const res = await (await getGovernanceService(identity)).getNeuronsForHW();

  res.forEach((n) => {
    console.log(
      `Neuron ID: ${n.id}, Amount: ${n.amount}, Hotkeys: ${n.hotKeys}`
    );
  });
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
        .requiredOption("--neuron-id <neuron-id>")
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
    )
    .addCommand(
      new Command("remove-hotkey")
        .requiredOption("--neuron-id <neuron-id>")
        .requiredOption("--principal <principal>")
        .action((args) => removeHotkey(args.neuronId, args.principal))
    )
    .addCommand(
      new Command("start-dissolving")
        .requiredOption("--neuron-id <neuron-id>")
        .action((args) => {
          startDissolving(args.neuronId);
        })
    )
    .addCommand(
      new Command("disburse-neuron")
        .requiredOption("--neuron-id <neuron-id>")
        .option("--to <account-identifier>")
        .option("--amount <amount>")
        .option("--subaccount <subaccount>", "ID of the subaccount")
        .action((args) => {
          disburseNeuron(args.neuronId, args.to, args.amount);
        })
    )
    .addCommand(
      new Command("spawn-neuron")
        .requiredOption("--neuron-id <neuron-id>")
        .option("--controller <new-controller>")
        .action((args) => {
          spawnNeuron(args.neuronId, args.controller);
        })
    )
    .addCommand(
      new Command("stop-dissolving")
        .requiredOption("--neuron-id <neuron-id>")
        .action((args) => {
          stopDissolving(args.neuronId);
        })
    )
    .addCommand(new Command("list-neurons").action(listNeurons));

  await program.parseAsync(process.argv);
}

main();
