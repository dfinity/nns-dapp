import 'package:core/core.dart';

import '../../dfinity.dart';

class HomeTabsWidget extends StatefulWidget {
  @override
  _HomeTabsWidgetState createState() => _HomeTabsWidgetState();
}

class _HomeTabsWidgetState extends State<HomeTabsWidget> {
  @override
  Widget build(BuildContext context) {
    final screenSize = context.mediaQuery.size;
    return DefaultTabController(
      initialIndex: 1,
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text("DFINITY Wallet"),
          bottom: PreferredSize(
            preferredSize: Size(screenSize.width, 80),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: TabBar(
                tabs: [
                  Tab(text: "Canisters"),
                  Tab(text: "Wallets"),
                  Tab(text: "Neurons"),
                ],
              ),
            ),
          ),
        ),
        body: SizedBox.expand(
          child: TabBarView(
            children: [CansitersTabWidget(), WalletsTabWidget(), NeuronsTabWidget()],
          ),
        ),
      ),
    );
  }
}
