import 'package:core/core.dart';
import 'package:dfinity_wallet/service/signing_service.dart';
import 'package:dfinity_wallet/ui/proposals/proposal_tab_widget.dart';

import '../../dfinity.dart';

class WalletsTabPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return HomePage(initialTabIndex: 0,);
  }
}


class CanistersTabPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return HomePage(initialTabIndex: 1,);
  }
}

class NeuronsTabPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return HomePage(initialTabIndex: 2,);
  }
}

class HomePage extends StatefulWidget  {

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
                        fontSize: 24, color: AppColors.white, fontFamily: Fonts.circularMedium, letterSpacing: 4),
                  ),
                ),
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                bottom: PreferredSize(
                  preferredSize: Size(screenSize.width, 150),
                  child: Container(
                    color: Color(0xff0B0C0C),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Container(
                        decoration: BoxDecoration(color: Color(0xff282A2D), borderRadius: BorderRadius.circular(16)),
                        child: TabBar(
                          indicator: BoxDecoration(color: Color(0xff0081FF), borderRadius: BorderRadius.circular(16)),
                          indicatorSize: TabBarIndicatorSize.tab,
                          labelPadding: EdgeInsets.symmetric(vertical: 15, horizontal: 10),
                          unselectedLabelColor: AppColors.gray400,
                          labelColor: AppColors.white,
                          labelStyle: TextStyle(fontFamily: Fonts.circularMedium, fontSize: 20, letterSpacing: 1.2),
                          tabs: [
                            Tab(text: "WALLETS"),
                            Tab(text: "CANISTERS"),
                            Tab(text: "NEURONS"),
                            Tab(text: "GOVERNANCE"),
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
          child: Stack(
            children: [
              SizedBox.expand(
                child: Image.asset(
                  "assets/background_image.jpg",
                  fit: BoxFit.cover,
                  // color: Color(0xff0F0C18),
                ),
              ),
              TabBarView(
                children: [WalletsPage(), CansitersPage(), NeuronsPage(), ProposalTabWidget()],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
