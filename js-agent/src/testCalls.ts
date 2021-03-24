import WalletApi from "./WalletApi";
import { AnonymousIdentity, Principal } from "@dfinity/agent";
import BigNumber from "bignumber.js";
import { ICPTs } from "./canisters/ledger/service";

const TRANSACTION_FEE : ICPTs = { doms: new BigNumber(137) };

export default function(walletApi: WalletApi) {
    console.log("Enter testCalls");

    const identity = new AnonymousIdentity();
    const icEndpoint = "http://10.12.31.5:8080/";
    const myPrincipal = Principal.fromText("347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe");

    const governanceService = walletApi.buildGovernanceService(
        icEndpoint,
        identity
    );

    const ledgerService = walletApi.buildLedgerService(
        icEndpoint,
        identity);

    ledgerService.send({
        to: myPrincipal,
        fee: TRANSACTION_FEE,
        memo: new BigNumber(0),
        amount: { doms: new BigNumber(100_000_000) },
        block_height: [],
        from_subaccount: [],
        to_subaccount: []
    })

    const ledgerViewService = walletApi.buildLedgerViewService(
        icEndpoint,
        identity);

    console.log("Leave testCalls");
}