import 'package:forge2d/forge2d.dart';

import 'force.dart';
import 'package:core/core.dart';

class Node {
  final Body body;

  Node(this.body);

  List<Force> forces = [];
  List<Force> proximityForces = [];
  List<Node> proximityNodes = [];

  Offset get offset => body.position.toOffset();
}
