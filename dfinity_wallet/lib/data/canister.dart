import 'dart:math';

import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'canister.g.dart';

@HiveType(typeId: 102)
class Canister extends HiveObject{
    @HiveField(0)
    final String name;
    @HiveField(1)
    final String publicKey;
    @HiveField(2)
    DateTime? creationDate;
    @HiveField(3)
    int cyclesAdded = 0;

    int get cyclesSpent => creationDate!.difference(DateTime.now()).inSeconds;
    int get cyclesRemaining => max(0, cyclesAdded - DateTime.now().difference(creationDate!).inSeconds);

    Canister(this.name, this.publicKey){
        this.creationDate = DateTime.now();
        // final random = Random();
        // cyclesRemaining = random.nextInt(1000000);
        // cyclesSpent = random.nextInt(1000000);
    }
}

