import 'dart:math';

import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:dartx/dartx.dart';

import 'icp_source.dart';

part 'wallet.g.dart';

@HiveType(typeId: 1)
class Wallet extends DfinityEntity with ICPSource {
  @HiveField(0)
  final String name;
  @HiveField(1)
  final String address;
  @HiveField(2)
  final bool primary;
  @HiveField(3)
  late String domsBalance;
  @HiveField(4)
  List<Transaction> transactions;
  @HiveField(7)
  String? subAccountId;

  Wallet(
      this.name, this.address, this.primary, this.domsBalance, this.subAccountId, this.transactions);

  Wallet.create(
      {required this.name,
      required this.address,
      required this.primary,
      required this.subAccountId,
      required double icpBalance,
      required this.transactions}) {
    this.icpBalance = icpBalance;
  }

  @override
  String get identifier => address;
}

extension getPrimary on Box<Wallet> {
  Wallet get primary => values.firstWhere((element) => element.primary);
  Wallet? get maybePrimary => values.firstOrNullWhere((element) => element.primary);
  List<Wallet> get subAccounts => values.filterNot((element) => element.primary).toList();
}
