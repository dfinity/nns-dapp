import 'dart:math';

import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:dartx/dartx.dart';

import 'icp_source.dart';


part 'wallet.g.dart';



@HiveType(typeId : 1)
class Wallet extends DfinityEntity with ICPSource {
    @HiveField(0)
    final String name;
    @HiveField(1)
    final String address;
    Wallet(this.name, this.address);

    @HiveField(2)
    List<Transaction> transactions = [];
    double get balance => transactions.sumBy((element) => element.amount);

    @override
    int get identifier => address.hashCode;
}

class WalletService {
    static Uuid uuid = Uuid();
    static Wallet demoWallet() => Wallet("Wallet ${Random().nextInt(10)}", uuid.v4());
}