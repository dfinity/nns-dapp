import 'package:core/core.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';

class CansitersTabWidget extends StatefulWidget {
  @override
  _CansitersTabWidgetState createState() => _CansitersTabWidgetState();
}

class _CansitersTabWidgetState extends State<CansitersTabWidget> {
  @override
  Widget build(BuildContext context) {
    return TabTitleAndContent(title: "Canisters", content: Container(),);
  }
}
