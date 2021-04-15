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
  final String name;
  @HiveField(1)
  final String accountIdentifier;
  @HiveField(2)
  final bool primary;
  @HiveField(3)
  late String balance;
  @HiveField(4)
  List<Transaction> transactions;
  @HiveField(5)
  int? subAccountId;

  Account(
      this.name, this.accountIdentifier, this.primary, this.balance, this.subAccountId, this.transactions);

  Account.create(
      {required this.name,
      required this.accountIdentifier,
      required this.primary,
      required this.subAccountId,
      required this.balance,
      required this.transactions});

  @override
  String get identifier => accountIdentifier;

  @override
  String get address => accountIdentifier;
}

extension getPrimary on Box<Account> {
  Account get primary => values.firstWhere((element) => element.primary);
  Account? get maybePrimary => values.firstOrNullWhere((element) => element.primary);
  List<Account> get subAccounts => values.filterNot((element) => element.primary).toList();
}
