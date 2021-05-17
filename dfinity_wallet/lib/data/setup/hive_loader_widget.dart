import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/ui/home/landing_widget.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:observable/observable.dart';
import 'hive_coordinator.dart';
import '../data.dart';
import 'package:dfinity_wallet/dfinity.dart';

class HiveLoader extends StatefulWidget {
  final Widget child;

  HiveLoader(
      {Key? key, required this.child})
      : super(key: key);

  static HiveLoader of(BuildContext context) {
    return context.findAncestorWidgetOfExactType<HiveLoader>()!;
  }

  @override
  _HiveLoaderState createState() => _HiveLoaderState();
}

class _HiveLoaderState extends State<HiveLoader> {
  final HiveBoxes boxes = HiveBoxes();

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Stack(
        children: [
            HiveBoxesWidget(
                boxes:boxes,
                child: widget.child,
            )
        ],
      ),
    );
  }
}

class HiveBoxesWidget extends InheritedWidget {
  final HiveBoxes boxes;
  ObservableMap<String, Canister> get canisters => boxes.canisters;
  ObservableMap<String, Account> get accounts => boxes.accounts;
  ObservableMap<String, Neuron> get neurons => boxes.neurons;
  ObservableMap<String, Proposal> get proposals => boxes.proposals;

  HiveBoxesWidget({
    Key? key,
    required Widget child,
    required this.boxes
  })   : assert(child != null),
        super(key: key, child: child);

  static HiveBoxesWidget of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<HiveBoxesWidget>()!;
  }

  @override
  bool updateShouldNotify(HiveBoxesWidget old) {
    return false;
  }
}

extension BoxRetrieval on BuildContext {
  HiveBoxesWidget get boxes => HiveBoxesWidget.of(this);
}
