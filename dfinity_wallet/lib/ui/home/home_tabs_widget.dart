import 'package:core/core.dart';
import 'package:dfinity_wallet/ui/proposals/governance_tab_widget.dart';

import '../../dfinity.dart';
import 'nodes/node_world.dart';

class HomePage extends StatefulWidget {
  final int initialTabIndex;

  const HomePage({Key? key, this.initialTabIndex = 0}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    final screenSize = context.mediaQuery.size;
    return DefaultTabController(
      initialIndex: widget.initialTabIndex,
      length: 4,
      child: Scaffold(
        backgroundColor: AppColors.lightBackground,
        appBar: PreferredSize(
          preferredSize: Size(screenSize.width, 200),
          child: Stack(
            children: [
              SizedBox.expand(
                  child: Image.asset(
                "assets/dfinity_gradient.jpg",
                fit: BoxFit.fill,
              )),
              AppBar(
                centerTitle: true,
                title: Padding(
                  padding: const EdgeInsets.only(top: 32.0),
                  child: Text(
                    "INTERNET COMPUTER WALLET",
                    style: TextStyle(
                        fontSize: 24,
                        color: AppColors.white,
                        fontFamily: Fonts.circularMedium,
                        letterSpacing: 4),
                  ),
                ),
                actions: [
                  TextButton(
                    child: Text("Recieve", style: TextStyle(color: AppColors.white),),
                    onPressed: () async {
                      LoadingOverlay.of(context).showOverlay();
                      // await 10.seconds.delay;
                      await context.icApi.acquireICPTs(context.boxes.wallets.values.primary.address, BigInt.from(1500000000));
                      LoadingOverlay.of(context).hideOverlay();
                    },
                  )
                ],
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                bottom: PreferredSize(
                  preferredSize: Size(screenSize.width, 150),
                  child: Container(
                    color: Color(0xff0B0C0C),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Container(
                        decoration: BoxDecoration(
                            color: Color(0xff282A2D),
                            borderRadius: BorderRadius.circular(16)),
                        child: TabBar(
                          indicator: BoxDecoration(
                              color: Color(0xff0081FF),
                              borderRadius: BorderRadius.circular(16)),
                          indicatorSize: TabBarIndicatorSize.tab,
                          labelPadding: EdgeInsets.symmetric(
                              vertical: 15, horizontal: 10),
                          unselectedLabelColor: AppColors.gray400,
                          labelColor: AppColors.white,
                          labelStyle: TextStyle(
                              fontFamily: Fonts.circularMedium,
                              fontSize: 20,
                              letterSpacing: 1.2),
                          tabs: [
                            Tab(text: "ICPTs"),
                            Tab(text: "NEURONS"),
                            Tab(text: "GOVERNANCE"),
                            Tab(text: "CANISTERS"),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        body: SizedBox.expand(
          child: TabBarView(
            children: [
              WalletsPage(),
              NeuronsPage(),
              GovernanceTabWidget(),
              CansitersPage()
            ],
          ),
        ),
      ),
    );
  }
}
