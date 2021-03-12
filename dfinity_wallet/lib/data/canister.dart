import 'dart:math';

import 'package:uuid/uuid.dart';

class Canister {
    final String name;
    final String publicKey;
    DateTime? creationDate;
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

