import { AccountIdentifier, ICP, LedgerCanister } from ".";
import {
  InsufficientFunds,
  InvalidSender,
  TxCreatedInFuture,
  TxDuplicate,
  TxTooOld,
} from "./ledger";

describe("LedgerCanister.transfer", () => {
  it("handles invalid sender", async () => {
    const ledger = LedgerCanister.create({
      updateCallOverride: () => {
        return Promise.resolve(
          Error(`Reject code: 5
            Reject text: Canister ryjl3-tyaaa-aaaaa-aaaba-cai trapped explicitly: Panicked at 'Sending from 2vxsx-fae is not allowed', rosetta-api/ledger_canister/src/main.rs:135:9`)
        );
      },
    });

    const res = await ledger.transfer(
      AccountIdentifier.fromHex(
        "3e8bbceef8b9338e56a1b561a127326e6614894ab9b0739df4cc3664d40a5958"
      ),
      ICP.fromE8s(BigInt(100000))
    );

    expect(res).toBeInstanceOf(InvalidSender);
  });

  it("handles duplicate transaction", async () => {
    const ledger = LedgerCanister.create({
      updateCallOverride: () => {
        return Promise.resolve(
          Error(`Reject code: 5
            Reject text: Canister ryjl3-tyaaa-aaaaa-aaaba-cai trapped explicitly: Panicked at 'transaction is a duplicate of another transaction in block 1235123', rosetta-api/ledger_canister/src/main.rs:135:9`)
        );
      },
    });

    const res = await ledger.transfer(
      AccountIdentifier.fromHex(
        "3e8bbceef8b9338e56a1b561a127326e6614894ab9b0739df4cc3664d40a5958"
      ),
      ICP.fromE8s(BigInt(100000))
    );

    expect(res).toEqual(new TxDuplicate(BigInt(1235123)));
  });

  it("handles insufficient balance", async () => {
    const ledger = LedgerCanister.create({
      updateCallOverride: () => {
        return Promise.resolve(
          Error(`Reject code: 5
            Reject text: Canister ryjl3-tyaaa-aaaaa-aaaba-cai trapped explicitly: Panicked at 'the debit account doesn't have enough funds to complete the transaction, current balance: 123.46789123', rosetta-api/ledger_canister/src/main.rs:135:9`)
        );
      },
    });

    const res = await ledger.transfer(
      AccountIdentifier.fromHex(
        "3e8bbceef8b9338e56a1b561a127326e6614894ab9b0739df4cc3664d40a5958"
      ),
      ICP.fromE8s(BigInt(100000))
    );

    expect(res).toEqual(
      new InsufficientFunds(ICP.fromE8s(BigInt(12346789123)))
    );
  });

  it("handles future tx", async () => {
    const ledger = LedgerCanister.create({
      updateCallOverride: () => {
        return Promise.resolve(
          Error(`Reject code: 5
            Reject text: Canister ryjl3-tyaaa-aaaaa-aaaba-cai trapped explicitly: Panicked at 'transaction's created_at_time is in future', rosetta-api/ledger_canister/src/main.rs:135:9`)
        );
      },
    });

    const res = await ledger.transfer(
      AccountIdentifier.fromHex(
        "a2a794c66495083317e4be5197eb655b1e63015469d769e2338af3d3e3f3aa86"
      ),
      ICP.fromE8s(BigInt(100000))
    );

    expect(res).toEqual(new TxCreatedInFuture());
  });

  it("handles old tx", async () => {
    const ledger = LedgerCanister.create({
      updateCallOverride: () => {
        return Promise.resolve(
          Error(`Reject code: 5
            Reject text: Canister ryjl3-tyaaa-aaaaa-aaaba-cai trapped explicitly: Panicked at 'transaction is older than 123 seconds', rosetta-api/ledger_canister/src/main.rs:135:9`)
        );
      },
    });

    const res = await ledger.transfer(
      AccountIdentifier.fromHex(
        "3e8bbceef8b9338e56a1b561a127326e6614894ab9b0739df4cc3664d40a5958"
      ),
      ICP.fromE8s(BigInt(100000))
    );

    expect(res).toEqual(new TxTooOld(123));
  });
});
