/**
 * A CLI tool for testing the Ledger hardware wallet integration.
 *
 * As this matures, we may eventually spin it out to a proper tool for
 * people who prefer using CLI over the NNS dapp.
 */
import { Command, Option, InvalidArgumentError } from "commander";
import { LedgerIdentity } from "./src/ledger/identity";
import { principalToAccountIdentifier } from "./src/canisters/converter";
import governanceBuilder from "./src/canisters/governance/builder";
import GovernanceService, {
  EmptyResponse,
} from "./src/canisters/governance/model";
import LedgerService from "./src/canisters/ledger/model";
import { Agent, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";
import ledgerBuilder from "./src/canisters/ledger/builder";
import {
  AccountIdentifier,
  E8s,
  PrincipalString,
} from "./src/canisters/common/types";
import createNeuronImpl from "./src/canisters/createNeuron";
import chalk from "chalk";

// Add polyfill for `window.fetch` for agent-js to work.
// @ts-ignore (no types are available)
import fetch from "node-fetch";
global.fetch = fetch;

const program = new Command();
const log = console.log;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY + 6 * SECONDS_PER_HOUR;

async function getGovernanceService(
  identity: Identity
): Promise<GovernanceService> {
  return governanceBuilder(await getAgent(identity), identity);
}

async function getLedgerService(identity: Identity): Promise<LedgerService> {
  return ledgerBuilder(await getAgent(identity));
}

async function getAgent(identity: Identity): Promise<Agent> {
  const network = program.opts().network;

  // Only fetch the rootkey if the network isn't mainnet.
  const fetchRootKey = new URL(network).host == "ic0.app" ? false : true;

  const agent = new HttpAgent({
    host: program.opts().network,
    identity: identity,
  });

  if (fetchRootKey) {
    await agent.fetchRootKey();
  }

  return agent;
}

/**
 * Displays the account idenifier on the terminal and the wallet's screen.
 */
async function showInfo(showOnDevice?: boolean) {
  const identity = await getLedgerIdentity();
  const principal = identity.getPrincipal();
  const accountIdentifier = principalToAccountIdentifier(principal);

  const balance = await (
    await getLedgerService(new AnonymousIdentity())
  ).getBalances({
    accounts: [accountIdentifier],
  });

  log(chalk.bold(`Principal: `) + principal);
  log(chalk.bold(`Address (${identity.derivePath}): `) + accountIdentifier);
  log(chalk.bold(`Balance (e8s): `) + balance[accountIdentifier]);

  if (showOnDevice) {
    log("Displaying the principal and the address on the device...");
    await identity.showAddressAndPubKeyOnDevice();
  }
}

/**
 * Fetches the balance of the main account on the wallet.
 */
async function getBalance() {
  const identity = await LedgerIdentity.create();
  const accountIdentifier = principalToAccountIdentifier(
    identity.getPrincipal()
  );

  const ledgerService = await getLedgerService(new AnonymousIdentity());

  const balances = await ledgerService.getBalances({
    accounts: [accountIdentifier],
  });

  ok(
    `Address ${accountIdentifier} has balance ${balances[accountIdentifier]} e8s`
  );
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
  const blockHeight = await ledger.sendICPTs({
    to: to,
    amount: BigInt(amount),
    memo: BigInt(0),
  });

  log(
    `${chalk.green(
      chalk.bold("OK")
    )}: Transaction completed at block height ${blockHeight}.`
  );
}

/**
 * Stakes a new neuron.
 *
 * @param amount Amount to stake in e8s.
 */
async function stakeNeuron(amount: E8s) {
  const identity = await LedgerIdentity.create();
  const ledger = await getLedgerService(identity);
  const governance = await getGovernanceService(new AnonymousIdentity());

  // Flag that an upcoming stake neuron transaction is coming to distinguish
  // it from a "send ICP" transaction on the device.
  identity.flagUpcomingStakeNeuron();

  const neuronId = await createNeuronImpl(
    identity.getPrincipal(),
    ledger,
    governance,
    {
      stake: amount,
    }
  );

  ok(`Staked neuron with ID: ${neuronId}`);
}

async function addHotkey(neuronId: string, principal: string) {
  const identity = await LedgerIdentity.create();
  const governance = await getGovernanceService(identity);

  const response = await governance.addHotKey({
    neuronId: BigInt(neuronId),
    principal: principal,
  });

  logResult(response);
}

async function removeHotkey(neuronId: string, principal: string) {
  const identity = await LedgerIdentity.create();
  const governance = await getGovernanceService(identity);

  const response = await governance.removeHotKey({
    neuronId: BigInt(neuronId),
    principal: principal,
  });
  logResult(response);
}

async function disburseNeuron(
  neuronId: string,
  to?: AccountIdentifier,
  amount?: string
) {
  const identity = await getLedgerIdentity();
  const governance = await getGovernanceService(identity);

  const response = await governance.disburse({
    neuronId: BigInt(neuronId),
    toAccountId: to,
    amount: amount ? BigInt(amount) : undefined,
  });
  ok(`Disburse completed at block height ${response.transferBlockHeight}`);
}

async function spawnNeuron(
  neuronId: string,
  percentageToSpawn?: number,
  controller?: PrincipalString
) {
  const identity = await getLedgerIdentity();
  const governance = await getGovernanceService(identity);

  const response = await governance.spawn({
    percentageToSpawn: percentageToSpawn != null ? percentageToSpawn : null,
    neuronId: BigInt(neuronId),
    newController: controller ? controller : null,
  });
  ok(`Spawned neuron with ID ${response.createdNeuronId}`);
}

async function increaseDissolveDelay(
  neuronId: bigint,
  years: number,
  days: number,
  minutes: number,
  seconds: number
) {
  const identity = await LedgerIdentity.create();
  const governance = await getGovernanceService(identity);

  const additionalDissolveDelaySeconds =
    years * SECONDS_PER_YEAR +
    days * SECONDS_PER_DAY +
    minutes * SECONDS_PER_MINUTE +
    seconds;

  const response = await governance.increaseDissolveDelay({
    neuronId: neuronId,
    additionalDissolveDelaySeconds: additionalDissolveDelaySeconds,
  });
  logResult(response);
}

async function startDissolving(neuronId: string) {
  const identity = await LedgerIdentity.create();
  const response = await (
    await getGovernanceService(identity)
  ).startDissolving({
    neuronId: BigInt(neuronId),
  });
  logResult(response);
}

async function stopDissolving(neuronId: string) {
  const identity = await LedgerIdentity.create();
  const response = await (
    await getGovernanceService(identity)
  ).stopDissolving({
    neuronId: BigInt(neuronId),
  });
  log(response);
}

async function getLedgerIdentity(): Promise<LedgerIdentity> {
  const subaccountId = tryParseInt(program.opts().subaccount);
  if (subaccountId < 0 || subaccountId > 255) {
    throw new InvalidArgumentError(
      "Subaccount must be between 0 and 255 inclusive."
    );
  }
  return await LedgerIdentity.create(`m/44'/223'/0'/0/${subaccountId}`);
}

async function listNeurons() {
  const identity = await LedgerIdentity.create();
  const res = await (await getGovernanceService(identity)).getNeuronsForHW();

  // We filter neurons with no ICP, as they'll be garbage collected by the governance canister.
  res
    .filter((n) => BigInt(n.amount) > 0)
    .forEach((n) => {
      log(`Neuron ID: ${n.id}, Amount: ${n.amount}, Hotkeys: ${n.hotKeys}`);
    });
}

/**
 * Runs a function with a try/catch block.
 */
async function run(f: () => void) {
  try {
    await f();
  } catch (err) {
    log(`${chalk.bold(chalk.red("Error:"))} ${err}`);
  }
}

function ok(message?: string) {
  if (message) {
    log(`${chalk.green(chalk.bold("OK"))}: ${message}`);
  } else {
    log(`${chalk.green(chalk.bold("OK"))}`);
  }
}

function err(message: string) {
  log(`${chalk.bold(chalk.red("Error:"))} ${message}`);
}

function logResult(res: EmptyResponse) {
  if ("Ok" in res) {
    ok();
  } else if ("Err" in res) {
    err(`${res.Err.errorType} ${res.Err.errorMessage}`);
  }
}

function tryParseInt(value: string): number {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
}

function tryParseBigInt(value: string): bigint {
  try {
    return BigInt(value);
  } catch (err) {
    throw new InvalidArgumentError(err.toString());
  }
}

async function main() {
  const neuron = new Command("neuron")
    .description("Commands for managing neurons.")
    .showSuggestionAfterError()
    .addCommand(
      new Command("stake")
        .requiredOption("--amount <amount>", "Amount to stake in e8s.")
        .action((args) => run(() => stakeNeuron(args.amount)))
    )
    .addCommand(
      new Command("increase-dissolve-delay")
        .requiredOption("--neuron-id <neuron-id>", "Neuron ID", tryParseBigInt)
        .option("--years <years>", "Number of years", tryParseInt)
        .option("--days <days>", "Number of days", tryParseInt)
        .option("--minutes <minutes>", "Number of minutes", tryParseInt)
        .option("--seconds <seconds>", "Number of seconds", tryParseInt)
        .action((args) =>
          run(() =>
            increaseDissolveDelay(
              args.neuronId,
              args.years || 0,
              args.days || 0,
              args.minutes || 0,
              args.seconds || 0
            )
          )
        )
    )
    .addCommand(
      new Command("disburse")
        .requiredOption("--neuron-id <neuron-id>")
        .option("--to <account-identifier>")
        .option("--amount <amount>")
        .option("--subaccount <subaccount>", "ID of the subaccount")
        .action((args) => {
          run(() => disburseNeuron(args.neuronId, args.to, args.amount));
        })
    )
    .addCommand(
      new Command("spawn")
        .requiredOption("--neuron-id <neuron-id>")
        .option("--percentage-to-spawn <percentage-to-spawn>")
        .option("--controller <new-controller>")
        .action((args) => {
          run(() =>
            spawnNeuron(args.neuronId, args.percentageToSpawn, args.controller)
          );
        })
    )
    .addCommand(
      new Command("start-dissolving")
        .requiredOption("--neuron-id <neuron-id>")
        .action((args) => {
          run(() => startDissolving(args.neuronId));
        })
    )
    .addCommand(
      new Command("stop-dissolving")
        .requiredOption("--neuron-id <neuron-id>")
        .action((args) => {
          run(() => stopDissolving(args.neuronId));
        })
    )
    .addCommand(new Command("list").action(() => run(listNeurons)))
    .addCommand(
      new Command("add-hotkey")
        .requiredOption("--neuron-id <neuron-id>")
        .requiredOption("--principal <principal>")
        .action((args) => run(() => addHotkey(args.neuronId, args.principal)))
    )
    .addCommand(
      new Command("remove-hotkey")
        .requiredOption("--neuron-id <neuron-id>")
        .requiredOption("--principal <principal>")
        .action((args) =>
          run(() => removeHotkey(args.neuronId, args.principal))
        )
    );

  const icp = new Command("icp")
    .description("Commands for managing ICP.")
    .showSuggestionAfterError()
    .addCommand(
      new Command("balance")
        .description("Fetch current balance.")
        .action(() => {
          run(getBalance);
        })
    )
    .addCommand(
      new Command("send")
        .requiredOption(
          "--to <account-identifier>",
          "The address to send the funds to."
        )
        .requiredOption("--amount <amount>", "Amount to transfer in e8s.")
        .action((args) => run(() => sendICP(args.to, args.amount)))
    );

  program
    .description("A CLI for the Ledger hardware wallet.")
    .enablePositionalOptions()
    .showSuggestionAfterError()
    .addOption(
      new Option("--network <network>", "The IC network to talk to.")
        .default("https://ic0.app")
        .env("IC_NETWORK")
    )
    .addOption(
      new Option("--subaccount <subaccount>", "The subaccount to use.").default(
        0
      )
    )
    .addCommand(
      new Command("info")
        .option("-n --no-show-on-device")
        .description("Show the wallet's principal, address, and balance.")
        .action((args) => {
          run(() => showInfo(args.showOnDevice));
        })
    )
    .addCommand(icp)
    .addCommand(neuron);

  await program.parseAsync(process.argv);
}

main();
