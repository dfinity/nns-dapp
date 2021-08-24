import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:dfinity_wallet/ic_api/ic_api.dart';
import 'package:observable/observable.dart';
import 'package:dartx/dartx.dart';
import 'icp.dart';
import 'icp_source.dart';
import 'package:collection/collection.dart';

class Account extends DfinityEntity with ICPSource {
  String name;
  final String principal;
  final String accountIdentifier;
  final bool primary;
  ICP balance;
  List<Transaction> transactions;
  int? subAccountId;
  bool hardwareWallet;

  Account(
      {required this.name,
      required this.principal,
      required this.accountIdentifier,
      required this.primary,
      required this.subAccountId,
      required this.balance,
      required this.transactions,
      required this.hardwareWallet});

  @override
  String get identifier => accountIdentifier;

  @override
  String get address => accountIdentifier;

  @override
  ICPSourceType get type =>
      hardwareWallet ? ICPSourceType.HARDWARE_WALLET : ICPSourceType.ACCOUNT;
}

extension GetAccounts on ObservableMap<String, Account> {
  Account get primary => values.firstWhere((element) => element.primary);
  Account? get maybePrimary =>
      values.firstWhereOrNull((element) => element.primary);
  List<Account> get subAccounts => values
      .filterNot((element) => element.primary || element.hardwareWallet)
      .toList();
  List<Account> get hardwareWallets =>
      values.filter((element) => element.hardwareWallet).toList();
}
