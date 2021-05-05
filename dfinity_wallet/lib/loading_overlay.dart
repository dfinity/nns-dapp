import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_gifimage/flutter_gifimage.dart';

class LoadingOverlayController extends StatefulWidget {
  final Widget child;

  const LoadingOverlayController({Key? key, required this.child})
      : super(key: key);

  @override
  _LoadingOverlayControllerState createState() =>
      _LoadingOverlayControllerState();
}

class _LoadingOverlayControllerState extends State<LoadingOverlayController> {
  OverlayEntry? _overlayEntry;
  GlobalKey<_NodeState> overlayKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(this, child: widget.child);
  }

  void showOverlay() {
    _overlayEntry = _createOverlayEntry();
    Overlay.of(context)?.insert(_overlayEntry!);
  }

  OverlayEntry _createOverlayEntry() {
    return OverlayEntry(builder: (context) {
      return NodeOverlay(overlayKey, () {});
    });
  }

  void remove() async {
    await (overlayKey.currentState?.fadeOut() ?? Future.value(null));
    _overlayEntry?.remove();
    _overlayEntry = null;
  }
}

class NodeOverlay extends StatefulWidget {
  final Function tapped;

  NodeOverlay(Key? key, this.tapped) : super(key: key);

  @override
  _NodeState createState() => _NodeState();
}

class _NodeState extends State<NodeOverlay> with TickerProviderStateMixin {
  bool visible = false;
  late GifController controller;

  @override
  void initState() {
    super.initState();
    controller = GifController(vsync: this);
    controller.repeat(min:0,max:62,period:3.seconds);


    0.1.seconds.delay.then((value) {
      setState(() {
        visible = true;
      });
    });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        widget.tapped();
      },
      child: AnimatedOpacity(
        opacity: visible ? 1.0 : 0.0,
        duration: 1.seconds,
        child: Container(
            color: AppColors.lightBackground.withOpacity(0.9),
            child: FractionallySizedBox(
                widthFactor: 0.3,
                heightFactor: 0.3,
                child: Container(
                    decoration: BoxDecoration(
                        shape: BoxShape.rectangle,
                        // color: AppColors.white,
                        borderRadius: BorderRadius.circular(500),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.black,
                            blurRadius: 100,
                          ),
                          BoxShadow(
                            color: AppColors.black,
                            blurRadius: 100,
                          )
                        ]),
                    child: SizedBox.expand(
                      child: GifImage(
                        controller: controller,
                        image: AssetImage("assets/glitch-loop.webp"),
                      ),
                    )))),
        // child: IgnorePointer(child: NodeWorld(oscillationMultiplier: 2,))),
      ),
    );
  }

  Future<void> fadeOut() async {
    setState(() {
      visible = false;
    });
    await 1.seconds.delay;
  }
}

class LoadingOverlay extends InheritedWidget {
  final _LoadingOverlayControllerState state;

  const LoadingOverlay(
    this.state, {
    Key? key,
    required Widget child,
  })   : assert(child != null),
        super(key: key, child: child);

  static LoadingOverlay of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<LoadingOverlay>()!;
  }

  @override
  bool updateShouldNotify(LoadingOverlay old) {
    return false;
  }

  void showOverlay() {
    state.showOverlay();
  }

  void hideOverlay() {
    state.remove();
  }
}

extension ShowLoading on BuildContext {
  void showLoadingOverlay() => LoadingOverlay.of(this).showOverlay();

  void hideLoadingOverlay() => LoadingOverlay.of(this).hideOverlay();

  Future<T> performLoading<T>(Future<T> Function() action) async {
    final overlay = LoadingOverlay.of(this);
    overlay.showOverlay();
    T res = await action();
    overlay.hideOverlay();
    return res;
  }
}
