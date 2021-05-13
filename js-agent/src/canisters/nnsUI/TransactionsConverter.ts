import { Principal } from "@dfinity/agent";
import { Send, Transaction, TransactionType, Transfer } from "./model";
import { Transaction as RawTransaction } from "./rawService";
import { CREATE_CANISTER_MEMO, TOP_UP_CANISTER_MEMO } from "../constants";
import { bigIntToUint8Array, principalToAccountIdentifier } from "../converter";
import { buildSubAccount } from "../createNeuron";
import GOVERNANCE_CANISTER_ID from "../governance/canisterId";

const ZERO = BigInt(0);

export default class TransactionsConverter {
    private readonly stakeNeuronRecipientAccountIds = new Set<string>();
    private readonly createCanisterRecipientAccountIds = new Set<string>();
    private readonly topUpCanisterRecipientAccountIds = new Set<string>();
    private readonly blockHeightsWithMissingNotifications = new Map<bigint, number>(); // BlockHeight -> Index

    private constructor() {}

    // Transactions are returned from the backend in chronological order with most recent at position 0 and oldest in
    // the last position. But we need to process them in order starting from the oldest in order to assign the
    // notifications to the corresponding 'send' transactions. So we must iterate through the transactions in reverse.
    public static convert = (transactions: Array<RawTransaction>, principal: Principal) : Array<Transaction> => {
        const converter = new TransactionsConverter();
        const results = new Array<Transaction>(transactions.length);
        for (let i = transactions.length - 1; i >= 0; i--) {
            results[i] = converter.toTransaction(transactions[i], principal, i);
        }

        if (converter.blockHeightsWithMissingNotifications.size) {
            for (const i of converter.blockHeightsWithMissingNotifications.values()) {
                const transfer = results[i].transfer;
                if ("Send" in transfer) {
                    transfer.Send.incomplete = true;
                }
            }
        }

        return results;
    }

    private toTransaction = (transaction: RawTransaction, principal: Principal, index: number) : Transaction => {
        const [transfer, type] = this.toTransfer(transaction, principal, index);

        return {
            type,
            timestamp: transaction.timestamp.timestamp_nanos,
            blockHeight: transaction.block_height,
            memo: transaction.memo,
            transfer
        };
    }

    private toTransfer = (rawTransaction: RawTransaction, principal: Principal, index: number) : [Transfer, TransactionType] => {
        const rawTransfer = rawTransaction.transfer;
        const memo = rawTransaction.memo;
        const blockHeight = rawTransaction.block_height;
        let transfer: Transfer;
        let type: TransactionType;

        if ("Burn" in rawTransfer) {
            type = TransactionType.Burn;
            transfer ={
                Burn: {
                    amount: rawTransfer.Burn.amount.e8s
                }
            };
        } else if ("Mint" in rawTransfer) {
            type = TransactionType.Mint;
            transfer = {
                Mint: {
                    amount: rawTransfer.Mint.amount.e8s
                }
            };
        } else if ("Receive" in rawTransfer) {
            type = TransactionType.Receive;
            transfer = {
                Receive: {
                    from: rawTransfer.Receive.from,
                    amount: rawTransfer.Receive.amount.e8s,
                    fee: rawTransfer.Receive.fee.e8s
                }
            };
        } else if ("Send" in rawTransfer) {
            type = TransactionType.Send;
            const amount = rawTransfer.Send.amount.e8s;
            const to = rawTransfer.Send.to;
            if (memo > ZERO) {
                if (amount === ZERO) {
                    if (this.stakeNeuronRecipientAccountIds.has(to)) {
                        type = TransactionType.StakeNeuronNotification;
                        this.blockHeightsWithMissingNotifications.delete(memo);
                    } else if (this.createCanisterRecipientAccountIds.has(to)) {
                        type = TransactionType.CreateCanisterNotification;
                        this.blockHeightsWithMissingNotifications.delete(memo);
                    } else if (this.topUpCanisterRecipientAccountIds.has(to)) {
                        type = TransactionType.TopUpCanisterNotification;
                        this.blockHeightsWithMissingNotifications.delete(memo);
                    }
                } else {
                    if (memo === CREATE_CANISTER_MEMO) {
                        type = TransactionType.CreateCanister;
                        this.createCanisterRecipientAccountIds.add(rawTransfer.Send.to);
                        this.blockHeightsWithMissingNotifications.set(blockHeight, index);
                    } else if (memo === TOP_UP_CANISTER_MEMO) {
                        type = TransactionType.TopUpCanister;
                        this.topUpCanisterRecipientAccountIds.add(rawTransfer.Send.to);
                        this.blockHeightsWithMissingNotifications.set(blockHeight, index);
                    } else {
                        const stakeNeuronSubAccount = buildSubAccount(bigIntToUint8Array(memo), principal);
                        const stakeNeuronRecipient = principalToAccountIdentifier(GOVERNANCE_CANISTER_ID, stakeNeuronSubAccount);
                        if (stakeNeuronRecipient === rawTransfer.Send.to) {
                            type = TransactionType.StakeNeuron;
                            this.stakeNeuronRecipientAccountIds.add(rawTransfer.Send.to);
                            this.blockHeightsWithMissingNotifications.set(blockHeight, index);
                        }
                    }
                }
            }

            transfer = {
                Send: {
                    to: rawTransfer.Send.to,
                    amount: rawTransfer.Send.amount.e8s,
                    fee: rawTransfer.Send.fee.e8s,
                    incomplete: false
                }
            };
        } else {
            throw new Error("Unrecognised transfer type - " + JSON.stringify(rawTransfer));
        }

        return [transfer, type];
    }
}
