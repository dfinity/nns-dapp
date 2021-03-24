import WalletApi from "./WalletApi";
import { AnonymousIdentity, Principal } from "@dfinity/agent";
import BigNumber from "bignumber.js";
import { ICPTs } from "./canisters/ledger/service";
import LedgerService from "./canisters/ledger/service";
import GovernanceService, { ProposalInfo } from "./canisters/governance/service";

const TRANSACTION_FEE : ICPTs = fromDoms(137);

export default async function(walletApi: WalletApi) {
    console.log("Enter testCalls");

    const identity = new AnonymousIdentity();
    const icEndpoint = "http://10.12.31.5:8080/";
    const myPrincipal = Principal.fromText("347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe");

    const governanceService = walletApi.buildGovernanceService(icEndpoint, identity);
    const ledgerService = walletApi.buildLedgerService(icEndpoint,identity);
    const ledgerViewService = walletApi.buildLedgerViewService(icEndpoint, identity);

    const pendingProposals = await governanceService.get_pending_proposals();
    console.log(pendingProposals);

    // Get initial anon balance
    let balance = await getBalance(ledgerService, identity.getPrincipal());
    console.log(balance.toString());
    
    // Send ICPs from anon to Hamish
    await sendTokens(ledgerService, myPrincipal, 100_000_000);
    
    // Get new anon balance
    balance = await getBalance(ledgerService, identity.getPrincipal());
    console.log(balance.toString());    

    console.log("Leave testCalls");
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

    return result.doms;
}

function fromDoms(amount: number) : ICPTs {
    return { doms: new BigNumber(amount) }
}