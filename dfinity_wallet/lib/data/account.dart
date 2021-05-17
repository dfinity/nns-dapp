import 'dart:math';

import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:hive/hive.dart';
import 'package:observable/observable.dart';
import 'package:uuid/uuid.dart';
import 'package:dartx/dartx.dart';
import 'package:truncate/truncate.dart';

import 'icp_source.dart';


class Account extends DfinityEntity with ICPSource {
  String name;
  String accountIdentifier;
  final bool primary;
  late String balance;
  List<Transaction> transactions;
  int? subAccountId;
  bool hardwareWallet;

  Account(this.name, this.accountIdentifier, this.primary, this.balance,
      this.subAccountId, this.transactions, this.hardwareWallet);

  Account.create({required this.name,
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

  String shortId(double width) {
    return getShortId(width, accountIdentifier);
  }
}

extension GetAccounts on ObservableMap<String, Account> {
  Account get primary => values.firstWhere((element) => element.primary);
  Account? get maybePrimary =>
      values.firstOrNullWhere((element) => element.primary);
  List<Account> get subAccounts => values
      .filterNot((element) => element.primary || element.hardwareWallet)
      .toList();
  List<Account> get hardwareWallets =>
      values.filter((element) => element.hardwareWallet).toList();
}

String getShortId(double width, String longString) {
  int maxLen = 64;
  if (width <= 380) {
    maxLen = 20;
  } else if (width <= 483) {
    maxLen = 25;
  } else if (width <= 600) {
    maxLen = 40;
  } else if (width <= 750) {
    maxLen = 50;
  }
  return truncate(longString, maxLen,
      omission: "...", position: TruncatePosition.middle);
}