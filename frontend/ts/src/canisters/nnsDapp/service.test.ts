import Service from './Service';
import { _SERVICE } from './rawService';
import { GetTransactionsRequest } from './model';
import { mock } from 'jest-mock-extended';
import { Principal } from '@dfinity/principal';

describe('getAccount', () => {
  test('respects the certified flag', () => {
    const uncertified = mock<_SERVICE>();
    const uncertifiedResponse = {
      Ok: {
        principal: Principal.fromText('aaaaa-aa'),
        account_identifier: 'uncertified',
        hardware_wallet_accounts: [],
        sub_accounts: []
      }
    };
    uncertified.get_account.mockReturnValue(Promise.resolve(uncertifiedResponse));

    const certified = mock<_SERVICE>();
    const certifiedResponse = {
      AccountNotFound: null
    };
    certified.get_account.mockReturnValue(Promise.resolve(certifiedResponse));

    const dapp = new Service(uncertified, certified);
    expect(dapp.getAccount(false)).resolves.toStrictEqual({
      Ok: {
        principal: 'aaaaa-aa',
        accountIdentifier: 'uncertified',
        hardwareWalletAccounts: [],
        subAccounts: []
      }
    });
    expect(dapp.getAccount(true)).resolves.toStrictEqual(certifiedResponse);
    expect(uncertified.get_account).toBeCalledTimes(1);
    expect(certified.get_account).toBeCalledTimes(1);
  });
});

describe('getTransactions', () => {
  test('respects the certified flag', () => {
    const uncertified = mock<_SERVICE>();
    const uncertifiedResponse = {
      total: 123,
      transactions: []
    };
    uncertified.get_transactions.mockReturnValue(Promise.resolve(uncertifiedResponse));

    const certified = mock<_SERVICE>();
    const certifiedResponse = {
      total: 456,
      transactions: []
    };
    certified.get_transactions.mockReturnValue(Promise.resolve(certifiedResponse));

    const dapp = new Service(uncertified, certified);
    expect(dapp.getTransactions(mock<GetTransactionsRequest>(), false)).resolves.toStrictEqual(
      uncertifiedResponse
    );
    expect(dapp.getTransactions(mock<GetTransactionsRequest>(), true)).resolves.toStrictEqual(
      certifiedResponse
    );
    expect(uncertified.get_transactions).toBeCalledTimes(1);
    expect(certified.get_transactions).toBeCalledTimes(1);
  });
});

describe('getCanisters', () => {
  test('respects the certified flag', () => {
    const uncertified = mock<_SERVICE>();
    const uncertifiedResponse = [
      {
        name: 'malicious_name',
        canister_id: Principal.fromText('aaaaa-aa')
      }
    ];
    uncertified.get_canisters.mockReturnValue(Promise.resolve(uncertifiedResponse));

    const certified = mock<_SERVICE>();
    certified.get_canisters.mockReturnValue(Promise.resolve([]));

    const dapp = new Service(uncertified, certified);
    expect(dapp.getCanisters(false)).resolves.toStrictEqual([
      {
        name: 'malicious_name',
        canisterId: 'aaaaa-aa'
      }
    ]);
    expect(dapp.getCanisters(true)).resolves.toStrictEqual([]);
    expect(uncertified.get_canisters).toBeCalledTimes(1);
    expect(certified.get_canisters).toBeCalledTimes(1);
  });
});
