import 'package:core/widget_forces/quadratic_repulsion_widget_force.dart';
import 'package:core/widget_forces/quadratic_widget_wall_repulstion.dart';
import 'package:core/widget_forces/widget_body.dart';
import 'package:core/widget_forces/widget_body_dragger.dart';
import 'package:core/widget_forces/widget_distributor.dart';
import 'package:dartx/dartx.dart';
import '../core.dart';
import 'body_shape.dart';
import 'circle_body.dart';
import 'dual_widget_force.dart';
import 'game_loop.dart';
import 'package:forge2d/forge2d.dart';
import 'flame_extensions.dart';

class ForceLayout extends StatefulWidget {
  final List<WidgetBody> bodies;

  ForceLayout({@required Key key, @required this.bodies}) : super(key: key);

  @override
  _ForceLayoutState createState() => _ForceLayoutState();
}

class _ForceLayoutState extends State<ForceLayout> {
  GameLoop gameLoop;
  final World physicsWorld = World(Vector2.zero(), DefaultBroadPhaseBuffer(DynamicTreeFlatNodes()));
  Map<GlobalKey, Body> currentBodiesToKeys = {};
  WidgetBody draggingBody;
  Body ground;
  GlobalKey get layoutKey => widget.key;
  Map<GlobalKey, Size> keySizeCache = {};

  @override
  void initState() {
    super.initState();
    gameLoop = GameLoop((dt) {
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
        gameLoopCallback(dt);
      });
    });

    ground = physicsWorld.createBody(BodyDef()
      ..position = Vector2.zero()
      ..type = BodyType.STATIC
      ..fixedRotation = true);

    gameLoop.start();
  }

  @override
  void dispose() {
    super.dispose();
    gameLoop.stop();
  }

  @override
  Widget build(BuildContext context) {
    final dragger = context.findAncestorStateOfType<WidgetBodyDraggerState>();
    if (dragger != null) {
      dragger.worldBody = ground;
      dragger.physicsWorld = physicsWorld;
      dragger.draggableBodies = widget.bodies;
    }
    if (!(widget.key as GlobalKey).attached || !this.mounted) {
      return Container();
    }

    widget.bodies.forEach((element) {
      element.body = currentBodiesToKeys[element.forceKey];
    });
    final widgetKeyMap = widget.bodies.associateBy((element) => element.forceKey);

    final toRemove = currentBodiesToKeys.keys.filter((element) => !widgetKeyMap.containsKey(element)).toList();
    toRemove.forEach((element) {
      physicsWorld.destroyBody(currentBodiesToKeys[element]);
      currentBodiesToKeys.remove(element);
    });

    return LayoutBuilder(builder: (context, constraints) {
      return Stack(
        clipBehavior: Clip.none,
        children: widget.bodies
            .sortedByDescending((element) => element.sortOrder)
                .filter((element) => element.body?.position != null && sizeForFixtureShape(element.bodyShape) != null)
                .map((e) {
          final size = sizeForFixtureShape(e.bodyShape);
          final frame = Rect.fromCenter(center: e.body.position.toOffset(), width: size.width, height: size.height);

          return Positioned.fromRect(
            rect: frame,
            child: Container(
              key: e.forceKey,
              child: e.widget,
            ),
          );
        }).toList(),
      );
    });
  }

  void gameLoopCallback(double dt) {
    if (!this.mounted || !layoutKey.attached) {
      return;
    }
      final bounds = (widget.key as GlobalKey).frame;
      widget.bodies.forEach((element) {
        element.body = currentBodiesToKeys[element.forceKey];
      });

    final toAdd = widget.bodies.filter((element) => !currentBodiesToKeys.containsKey(element.forceKey)).toList();
    if (toAdd.isNotEmpty && layoutKey.currentContext != null && !physicsWorld.isLocked()) {
      final position = layoutKey.position;
      final size = layoutKey.currentContext.size;
      final rect = Rect.fromLTWH(position.dx, position.dy, size.width, size.height);
      addBodies(toAdd, rect);
      print("adding body");
    }

    physicsWorld.stepDt(dt, 100, 10);
    applyForcesToBodies(bounds);

    widget.bodies.mapNotNull((element) {
      final bodyShape = element.bodyShape;
      if (bodyShape is CircleBody) {
        return bodyShape.matchingWidgetKey;
      } else if (bodyShape is BoxBody) {
        return bodyShape.matchingWidgetKey;
      }else{
        return null;
      }
    }).forEach((globalKey) {
      if(globalKey.attached){
        keySizeCache[globalKey] = globalKey.currentContext.size;
      }
    });

      setState(() {});

  }

  void applyForcesToBodies(Rect frame) {
    final forcesStopwatch = Stopwatch()..start();

    final allKeys = widget.bodies.flatMap((element) => [
          layoutKey,
          element.forceKey,
          ...element.forces.flatMap((e) => e.widgetKeys),
        ]).distinct();
    final keyToFrameMap = allKeys.filterNot((element) => element?.currentContext == null).associateWith((element) => element.frame.toMeterRect);

    widget.bodies
        .filter((element) => element.body != null && element.forceKey.currentContext != null && !element.dragging)
        .forEach((widgetBody) {

      forcesStopwatch.start();
      widgetBody.forces.toList().forEach((force) {
        final receiverBody = widgetBody.body;

        Vector2 forceVector = Vector2.zero();
        if (force is QuadraticWidgetWallRepulsion) {
          final wallKey = force.wallWidgetKey ?? layoutKey;
          final rect = keyToFrameMap[wallKey];
          final recieverPos = keyToFrameMap[widgetBody.forceKey].center;
          forceVector = force.calculateForce(recieverPos.asVector(), worldRect: rect);
        } else if (force is DualWidgetForce) {
          if (!keyToFrameMap.containsKey(force.sender) || !keyToFrameMap.containsKey(force.receiver)) return;
          forceVector = force.calculateForce(keyToFrameMap[force.sender], keyToFrameMap[force.receiver]);
        } else if (force is PointAttractionForce) {
          forceVector = force.calculateForce(receiverBody.position);

          if (force.removalCriteria != null) {
            final closeEnough = receiverBody.position.distanceTo(force.attractionPoint.toWorldVector()) <
                force.removalCriteria.distance;
            final slowEnough = receiverBody.linearVelocity.length < force.removalCriteria.velocity;
            if (closeEnough && slowEnough) {
              widgetBody.forces.remove(force);
              force.onRemoval();
            }
          }
        }

        receiverBody.applyLinearImpulse(forceVector, point: receiverBody.position, wake: true);
      });
      forcesStopwatch.stop();
    });

  }

  void addBodies(Iterable<WidgetBody> toAdd, Rect frame) {
    final distributor = WidgetDistributor(widget.bodies, frame.toMeterRect);
    toAdd.forEach((entry) {
      final position = distributor.positionForWidget(entry.forceKey);
      final physicsBody = physicsWorld.createBody(WidgetBody.createBodyDef(position, damping: entry.damping));
      entry.body = physicsBody;
      currentBodiesToKeys[entry.forceKey] = physicsBody;
    });
  }

  Size sizeForFixtureShape(BodyShape bodyShape) {
    if (bodyShape is CircleBody) {
      return keySizeCache[bodyShape.matchingWidgetKey];
    } else if (bodyShape is BoxBody) {
      return keySizeCache[bodyShape.matchingWidgetKey];
    } else if (bodyShape is FixedCircleBody) {
      return Size.fromRadius(bodyShape.radius);
    }
    return null;
  }
}

bool isApproximatelyEqual(Size size1, Size size2) {
  if (size1 == null || size2 == null) return false;
  final widthDiff = (size1.width - size2.width).abs();
  final heightDiff = (size1.height - size2.height).abs();
  final equals = widthDiff < 3 && heightDiff < 3;
  return equals;
}
