import 'dart:ui';

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
  double timeSinceNodeOperations = 1;
  double totalDuration = 0;
  late Node centralNode;

  final World physicsWorld =
      World(Vector2.zero(), DefaultBroadPhaseBuffer(DynamicTreeFlatNodes()));
  WallRepulsionForce wallRepulsionForce = WallRepulsionForce(wallCharge: 7);
  // CenterRepulsionForce centerRepulsionForce = CenterRepulsionForce(charge: 2);

  @override
  void initState() {
    super.initState();
    nodes = 0.rangeTo(widget.numNodes).map((e) {
      final position = widget.worldRect.scaleSize(0.5).randomVectorInside;
      return makeNode(position);
    }).toList();

    centralNode = makeNode(widget.worldRect.center.asVector());
    centralNode.respondsToForces = false;

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
      });
    });
    gameLoop.start();
  }

  Node makeNode(Vector2 position) {
    return Node(physicsWorld.createBody(BodyDef()
      ..fixedRotation = true
      ..type = BodyType.DYNAMIC
      ..linearDamping = 3
      ..position = position));
  }


  void buildProximityMap() {
    final numNodes = 4;
    nodes.forEach((node) {
      findClosestNodes(node, numNodes);
      node.connectedNodes = [];
    });

    findClosestNodes(centralNode, 7);
    centralNode.closestNodes.forEach((e) => e.connectedNodes.add(centralNode));

    List<Line> otherLines = [];
    0.rangeTo(numNodes - 1).forEach((index) {
      nodes.forEach((thisNode) {
        final possiblePair = thisNode.closestNodes[index];
        final proposedLine =
            Line(possiblePair.body.position, thisNode.body.position);
        if (otherLines.none((element) => element.crosses(proposedLine)) && !thisNode.connectedNodes.contains(proposedLine)) {
          otherLines.add(proposedLine);

          thisNode.connectedNodes.add(possiblePair);
          possiblePair.connectedNodes.add(thisNode);
        }
      });
    });
  }

  void findClosestNodes(Node node, int numNodes) {
    node.closestNodes = nodes
        .filter((element) => element != node)
        .sortedBy((element) =>
            element.body.position.distanceToSquared(node.body.position))
        .take(numNodes)
        .toList();
  }

  bool runSimulation(double multiplier) {
    physicsWorld.stepDt(100, 100, 10);
    return applyForcesToBodies(multiplier);
  }

  bool applyForcesToBodies(double multiplier) {
    final lowestCharge = nodes.minBy((e) => e.charge)!.charge;
    final highestCharge = nodes.maxBy((e) => e.charge)!.charge;
    final diff = highestCharge - lowestCharge;


    nodes.forEach((node) {
      final nodeDistance = distanceToCenter(node);
      final neighbourCharges = node.connectedNodes.filter((element) => distanceToCenter(element) < nodeDistance).map((e) => e.charge);
      if(neighbourCharges.isNotEmpty){
        node.charge = lerpDouble(node.charge , neighbourCharges.average(), 0.05)!;
      }




      nodes.filterNot((element) => element == node && element.respondsToForces).forEach((otherNode) {
        var distanceSquared = node.position.distanceToSquared(otherNode.position);
        if (distanceSquared < 3) {
          distanceSquared = 3;
        }

        final amountAboveLowest = (node.charge + otherNode.charge)/2 - lowestCharge;
        final charge = amountAboveLowest / (diff + 1);

        var influence = charge / distanceSquared;
        final force = otherNode.position.directionTo(node.position)
          ..scale(influence);

        final impulse = force * multiplier;
        otherNode.body.applyLinearImpulse(impulse, point: otherNode.position, wake: true);
      });

      if(node.respondsToForces){
        node.body.applyLinearImpulse(wallRepulsionForce
            .calculateForce(node.body.position, worldRect: widget.worldRect));
        // node.body.applyLinearImpulse(centerRepulsionForce.calculateForce(
        //     bodyPosition: node.body.position, worldRect: widget.worldRect));
      }
    });

    return nodes.all((element) => element.body.linearVelocity.length < 0.2);
  }

  double distanceToCenter(Node node) => node.position.distanceTo(centralNode.position);

  void gameLoopCallback(double dt) {
    if (!this.mounted) {
      return;
    }

    timeSinceNodeOperations += dt;
    if (timeSinceNodeOperations > 0.1) {
      timeSinceNodeOperations = 0;
      buildProximityMap();
    }

    totalDuration += dt;
    centralNode.charge =(sin(totalDuration)) * 3;

    physicsWorld.stepDt(dt, 100, 10);
    applyForcesToBodies(1);

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (details) {
        nodes.forEach((n) {
          n.charge += n.body.position
              .forceFromChargeAtPosition(
              100, details.localPosition.toWorldVector())
              .length;
          n.body.applyLinearImpulse(
              n.body.position.forceFromChargeAtPosition(
                  10, details.localPosition.toWorldVector()),
              point: n.body.position);
        });
      },
      onPanUpdate: (details) {
        nodes.forEach((n) {
          n.body.applyLinearImpulse(
              n.body.position.forceFromChargeAtPosition(
                  1, details.localPosition.toWorldVector()),
              point: n.body.position);
          n.charge += n.body.position
              .forceFromChargeAtPosition(
              10, details.localPosition.toWorldVector())
              .length;
        });
      },
      child: CustomPaint(
        painter: NodePainter(nodes),
      ),
    );
  }
}

class Line {
  final Vector2 start;
  final Vector2 end;

  Rect get boundingRect => Rect.fromLTRB(min(start.x, end.x),
          min(start.y, end.y), max(start.x, end.x), max(start.y, end.y))
      .inflate(3);

  Line(this.start, this.end);

  bool crosses(Line otherLine) {
    final intersection = findIntersection(this, otherLine);
    return false;
  }
}

Offset findIntersection(Line l1, Line l2) {
  final a1 = l1.end.y - l1.start.y;
  final b1 = l1.start.x - l1.end.x;
  final c1 = a1 * l1.start.x + b1 * l1.start.y;

  final a2 = l2.end.y - l2.start.y;
  final b2 = l2.start.x - l2.end.x;
  final c2 = a2 * l2.start.x + b2 * l2.start.y;

  final delta = a1 * b2 - a2 * b1;
// If lines are parallel, intersection point will contain infinite values
  final x = (b2 * c1 - b1 * c2) / delta;
  final y = (a1 * c2 - a2 * c1) / delta;
  final offset = Offset(x, y);

  return offset;
}
