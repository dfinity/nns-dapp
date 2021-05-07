import 'dart:math';

import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:dartx/dartx.dart';

import 'icp_source.dart';

part 'account.g.dart';

@HiveType(typeId: 101)
class Account extends DfinityEntity with ICPSource {
  @HiveField(0)
  String name;
  @HiveField(1)
  String accountIdentifier;
  @HiveField(2)
  final bool primary;
  @HiveField(3)
  late String balance;
  @HiveField(4)
  List<Transaction> transactions;
  @HiveField(5)
  int? subAccountId;
  @HiveField(6)
  HiveList<Neuron>? neurons;
  @HiveField(7)
  bool hardwareWallet;

  Account(
      this.name, this.accountIdentifier, this.primary, this.balance, this.subAccountId, this.transactions, this.neurons, this.hardwareWallet);

  Account.create(
      {required this.name,
      required this.accountIdentifier,
      required this.primary,
      required this.subAccountId,
      required this.balance,
      required this.transactions,
      required this.neurons,
      required this.hardwareWallet});

  @override
  String get identifier => accountIdentifier;

  @override
  String get address => accountIdentifier;

  @override
  ICPSourceType get type => hardwareWallet ? ICPSourceType.HARDWARE_WALLET : ICPSourceType.ACCOUNT;
}

extension GetAccounts on Box<Account> {
  Account get primary => values.firstWhere((element) => element.primary);
  Account? get maybePrimary => values.firstOrNullWhere((element) => element.primary);
  List<Account> get subAccounts => values.filterNot((element) => element.primary || element.hardwareWallet).toList();
  List<Account> get hardwareWallets => values.filter((element) => element.hardwareWallet).toList();
}
