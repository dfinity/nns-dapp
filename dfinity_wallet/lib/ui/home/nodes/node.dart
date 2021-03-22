import 'package:forge2d/forge2d.dart';

import 'force.dart';
import 'package:core/core.dart';

class Node {
  final Body body;
  double charge = random.nextDouble() ;
  bool respondsToForces = true;

  Node(this.body);

  List<Force> forces = [];
  List<Node> closestNodes = [];
  List<Node> connectedNodes = [];

  Offset get offset => body.position.toOffset();
  Vector2 get position => body.position;
}

