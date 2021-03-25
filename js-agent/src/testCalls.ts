import WalletApi from "./WalletApi";
import { AnonymousIdentity, Principal } from "@dfinity/agent";
import BigNumber from "bignumber.js";
import { ICPTs } from "./canisters/ledger/rawService";
import LedgerService from "./canisters/ledger/rawService";
import LedgerViewService, { GetTransactionsResponse } from "./canisters/ledgerView/rawService";
import GovernanceService, { ProposalInfo } from "./canisters/governance/rawService";

const TRANSACTION_FEE : ICPTs = fromDoms(137);

export default async function(walletApi: WalletApi) {
    console.log("Enter testCalls");

    const identity = new AnonymousIdentity();
    const principal = identity.getPrincipal();
    const icEndpoint = "http://10.12.31.5:8080/";
    const hamishPrincipal = Principal.fromText("347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe");

    const governanceService = walletApi.buildGovernanceService(icEndpoint, identity);
    const ledgerService = walletApi.buildLedgerService(icEndpoint,identity);
    const ledgerViewService = walletApi.buildLedgerViewService(icEndpoint, identity);
    console.log("created services");

    const pendingProposals = await governanceService.get_pending_proposals();
    console.log(pendingProposals);

    await getBalance(ledgerService, principal);    
    await sendTokens(ledgerService, hamishPrincipal, 100_000_000);
    await getBalance(ledgerService, principal);
    await getTransactions(ledgerViewService);
    await getBalance(ledgerService, hamishPrincipal);

    console.log("Leave testCalls");
}

async function getTransactions(ledgerViewService: LedgerViewService): Promise<GetTransactionsResponse> {
    let results = await ledgerViewService.get_transactions({
        page_size: 10,
        offset: 0
    });

    console.log(results);

    return results;
}

async function sendTokens(ledgerService: LedgerService, to: Principal, amount: number): Promise<BigNumber> {
    let result =  await ledgerService.send({
        to: to,
        fee: TRANSACTION_FEE,
        memo: new BigNumber(0),
        amount: fromDoms(amount),
        block_height: [],
        from_subaccount: [],
        to_subaccount: []
    });   

    console.log(result);

    return result;
}

async function getBalance(ledgerService: LedgerService, principal: Principal): Promise<BigNumber> {
    let result = await ledgerService.account_balance({
        sub_account: [],
        account: principal
    });

    const balance = result.doms;

    console.log(balance.toString());    

    return balance;
}

function fromDoms(amount: number) : ICPTs {
    return { doms: new BigNumber(amount) }
}
