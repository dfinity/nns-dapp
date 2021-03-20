
import 'node.dart';
import 'package:forge2d/forge2d.dart';
import 'package:core/core.dart';

abstract class Force {
  final double charge;
  final Node sender;
  final Node receiver;

  Force(this.sender, this.receiver, this.charge);
  Vector2 calculateForce();
}

class RepulsionForce extends Force {
  RepulsionForce(
      {required Node sender, required Node receiver, required double charge})
      : super(sender, receiver, charge);

  Vector2 calculateForce() {
    var distanceSquared =
    sender.body.position.distanceToSquared(receiver.body.position);
    if (distanceSquared < 3) {
      distanceSquared = 3;
    }
    var influence = charge / distanceSquared;
    return receiver.body.position.directionTo(sender.body.position)
      ..scale(influence);
  }
}



class AttractionForce extends Force {
  AttractionForce(
      {required Node sender, required Node receiver, required double charge})
      : super(sender, receiver, charge);

  Vector2 calculateForce() {
    return sender.body.position.directionTo(receiver.body.position)
      ..scale(charge);
  }
}

