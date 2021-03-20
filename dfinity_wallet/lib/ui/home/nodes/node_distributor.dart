import 'package:core/widget_forces/game_loop.dart';
import 'package:dfinity_wallet/ui/home/nodes/wall_repulsion_force.dart';

import '../../../dfinity.dart';
import 'force.dart';
import 'node.dart';
import 'package:core/core.dart';
import 'package:forge2d/forge2d.dart';
import 'dart:math';

import 'node_painter.dart';

class NodeDistributor extends StatefulWidget {
  Rect worldRect;
  int numNodes;

  NodeDistributor(this.worldRect, this.numNodes);

  static Random random = Random();

  @override
  _NodeDistributorState createState() => _NodeDistributorState();
}

class _NodeDistributorState extends State<NodeDistributor> {
  late List<Node> nodes;
  late GameLoop gameLoop;

  final World physicsWorld =
      World(Vector2.zero(), DefaultBroadPhaseBuffer(DynamicTreeFlatNodes()));

  WallRepulsionForce wallRepulsionForce = WallRepulsionForce(wallCharge: 5);
  CenterRepulsionForce centerRepulsionForce = CenterRepulsionForce(charge: 5);

  @override
  void initState() {
    super.initState();
    nodes = 0.rangeTo(widget.numNodes).map((e) {
      final position = widget.worldRect.scaleSize(0.5).randomVectorInside;
      return Node(physicsWorld.createBody(BodyDef()
        ..fixedRotation = true
        ..type = BodyType.DYNAMIC
        ..linearDamping = 1
        ..position = position));
    }).toList();

    nodes.forEach((e) {
      e.forces = nodes.filterNot((other) => other == e).mapToList(
          (other) => RepulsionForce(sender: other, receiver: e, charge: 0.5));
    });

    logTime("time to layout", () {
      var hasCompleted = false;
      var numIterations = 0;
      while ((!hasCompleted || numIterations < 10) && numIterations < 100) {
        final multiplier = sqrt((40 - numIterations).clamp(1, 20));
        final clamped = max(1.0, multiplier);
        hasCompleted = runSimulation(clamped);
        numIterations++;
        // print("multiplier $multiplier");
      }
      // print("numiterations $numIterations");
    });

    buildProximityMap();

    gameLoop = GameLoop((dt) {
      WidgetsBinding.instance!.addPostFrameCallback((timeStamp) {
        gameLoopCallback(dt);
        buildProximityMap();
      });
    });
    gameLoop.start();
  }

  void buildProximityMap() {
    nodes.forEach((node) {
      node.proximityNodes = nodes
          .filter((element) => element != node)
          .filter((element) => element.body.position.distanceTo(node.body.position) < 5)
          .toList();

      node.proximityForces = node.proximityNodes.mapToList((e) => AttractionForce(sender: e, receiver: node, charge: 0.1));
    });
  }

  bool runSimulation(double multiplier) {
    physicsWorld.stepDt(100, 100, 10);
    return applyForcesToBodies(multiplier);
  }

  bool applyForcesToBodies(double multiplier) {
    nodes.forEach((node) {
      node.forces.forEach((force) {
        final receiverBody = node.body;

        final impulse = force.calculateForce() * multiplier;
        receiverBody.applyLinearImpulse(impulse,
            point: receiverBody.position, wake: true);
      });

      node.body.applyLinearImpulse(wallRepulsionForce
          .calculateForce(node.body.position, worldRect: widget.worldRect));
      node.body.applyLinearImpulse(centerRepulsionForce
          .calculateForce(bodyPosition: node.body.position, worldRect: widget.worldRect));
    });

    return nodes.all((element) => element.body.linearVelocity.length < 1);
  }

  void gameLoopCallback(double dt) {
    if (!this.mounted) {
      return;
    }
    physicsWorld.stepDt(dt, 100, 10);
    applyForcesToBodies(1);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: NodePainter(nodes),
    );
  }
}


