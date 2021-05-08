import 'package:core/core.dart';
import 'package:dfinity_wallet/ui/home/auth_widget.dart';
import 'package:dfinity_wallet/ui/neurons/tab/neurons_tab_widget.dart';
import 'package:dfinity_wallet/ui/proposals/governance_tab_widget.dart';
import 'package:dfinity_wallet/ui/wallet/accounts_tab_widget.dart';
import 'package:hive/hive.dart';

import '../../dfinity.dart';

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
          preferredSize: Size(screenSize.width, 160),
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
                  padding: const EdgeInsets.only(top: 4.0),
                  child: Text(
                    "NETWORK NERVOUS SYSTEM",
                    style: TextStyle(
                        fontSize: 24,
                        color: AppColors.white,
                        fontFamily: Fonts.circularMedium,
                        letterSpacing: 4),
                  ),
                ),
                actions: [
                  if(true)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: TextButton(
                      child: Text(
                        "Receive",
                        style: TextStyle(color: AppColors.white),
                      ),
                      onPressed: () async {
                        OverlayBaseWidget.show(
                            context,
                            TextFieldDialogWidget(
                                title: "How much?",
                                buttonTitle: "Get",
                                fieldName: "ICP",
                                onComplete: (name) {
                                  final amount = BigInt.from(name.toDouble()) *
                                      BigInt.from(100000000);
                                  context.performLoading(() => context.icApi
                                      .acquireICPTs(
                                          accountIdentifier: context
                                              .boxes
                                              .accounts
                                              .primary
                                              .accountIdentifier,
                                          doms: amount));
                                }),
                            borderRadius: 20);
                      },
                    ),
                  ),
                  if(true)
                  TextButton(
                      child: Text(
                        "Test",
                        style: TextStyle(color: AppColors.white),
                      ),
                      onPressed: () async {
                        context.icApi.test();
                      }),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: TextButton(
                      child: Text(
                        "Logout",
                        style: TextStyle(color: AppColors.white),
                      ),
                      onPressed: () async {
                        context.boxes.hiveCoordinator.deleteAllData();
                        context.nav.replaceAll(AuthPage);
                      },
                    ),
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
                            Tab(text: "ICP"),
                            Tab(text: "NEURONS"),
                            Tab(text: "VOTING"),
                            Tab(text: "DEPLOY"),
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
              AccountsTabWidget(),
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
