import 'package:core/core.dart';
import 'package:flutter/scheduler.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/proposals/governance_tab_widget.dart';
import 'package:universal_html/html.dart' as html;
import 'package:nns_dapp/data/env.dart' as env;
import '../../nns_dapp.dart';

const DEPLOY_ENV = String.fromEnvironment('DEPLOY_ENV');

class HomePage extends StatefulWidget {
  final int initialTabIndex;

  const HomePage({
    Key? key,
    this.initialTabIndex = 0,
  }) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late PageConfig pageName;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(
        vsync: this, length: 4, initialIndex: widget.initialTabIndex);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        if (_tabController.index == 0) {
          pageName = accountsTabPage;
          if (!env.showAccountsRoute()) {
              html.window.location.replace("/v2/#/accounts");
          }
        } else if (_tabController.index == 1) {
          pageName = neuronTabsPage;
          if (!env.showNeuronsRoute()) {
              html.window.location.replace("/v2/#/neurons");
          }
        } else if (_tabController.index == 2) {
          pageName = proposalsTabPage;
          if (!env.showProposalsRoute()) {
              html.window.location.replace("/v2/#/proposals");
          }
        } else if (_tabController.index == 3) {
          pageName = canistersTabPage;
          if (!env.showCanistersRoute()) {
              html.window.location.replace("/v2/#/canisters");
          }
        }
        context.nav.push(pageName);
        setState(() {
          timeDilation = 0.6;
        });
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = context.mediaQuery.size;
    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      appBar: PreferredSize(
        preferredSize: Size(screenSize.width, 160),
        child: Stack(
          children: [
            SizedBox.expand(
                child: Image.asset(
              "assets/gradient.jpg",
              fit: BoxFit.fill,
            )),
            AppBar(
              centerTitle: true,
              title: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: Text(
                    "NETWORK NERVOUS SYSTEM",
                    style: TextStyle(
                        fontSize: Responsive.isDesktop(context)
                            ? 24
                            : Responsive.isTablet(context)
                                ? 18
                                : 12,
                        color: AppColors.white,
                        fontFamily: Fonts.circularMedium,
                        letterSpacing: 2),
                  )),
              actions: [
                if (DEPLOY_ENV == "staging")
                  Padding(
                    padding: Responsive.isDesktop(context)
                        ? const EdgeInsets.only(top: 20.0, right: 20.0)
                        : Responsive.isTablet(context)
                            ? const EdgeInsets.only(top: 20.0, right: 40.0)
                            : const EdgeInsets.only(top: 20.0, right: 8.0),
                    child: TextButton(
                      child: Text(
                        "Get ICPs",
                        style: Responsive.isDesktop(context)
                            ? TextStyle(color: AppColors.white, fontSize: 20)
                            : Responsive.isTablet(context)
                                ? TextStyle(
                                    color: AppColors.white, fontSize: 18)
                                : TextStyle(
                                    color: AppColors.white, fontSize: 9),
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
                Padding(
                  padding: Responsive.isDesktop(context)
                      ? const EdgeInsets.only(top: 20.0, right: 20.0)
                      : Responsive.isTablet(context)
                          ? const EdgeInsets.only(top: 20.0, right: 40.0)
                          : const EdgeInsets.only(top: 20.0, right: 8.0),
                  child: TextButton(
                    child: Text(
                      "Logout",
                      style: Responsive.isDesktop(context)
                          ? TextStyle(color: AppColors.white, fontSize: 20)
                          : Responsive.isTablet(context)
                              ? TextStyle(color: AppColors.white, fontSize: 18)
                              : TextStyle(color: AppColors.white, fontSize: 9),
                    ),
                    onPressed: () async {
                      context.icApi.logout();
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
                    padding: const EdgeInsets.symmetric(
                        vertical: 10.0, horizontal: 20.0),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        decoration: BoxDecoration(color: Color(0xff282A2D)),
                        child: TabBar(
                          onTap: (value) {
                            timeDilation = 0.05;
                          },
                          physics: const NeverScrollableScrollPhysics(),
                          controller: _tabController,
                          indicator: BoxDecoration(color: Color(0xff0081FF)),
                          indicatorSize: TabBarIndicatorSize.tab,
                          labelPadding:
                              EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                          unselectedLabelColor: AppColors.gray400,
                          labelColor: AppColors.white,
                          labelStyle: TextStyle(
                              fontFamily: Fonts.circularMedium,
                              fontSize: 20,
                              letterSpacing: 0),
                          tabs: [
                            TabDesign(title: "ICP"),
                            TabDesign(title: "NEURONS"),
                            TabDesign(title: "VOTING"),
                            TabDesign(title: "CANISTERS"),
                          ],
                        ),
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
          physics: const NeverScrollableScrollPhysics(),
          controller: _tabController,
          children: [
            AccountsTabWidget(),
            NeuronsPage(),
            GovernanceTabWidget(),
            CanistersPage()
          ],
        ),
      ),
    );
  }
}

class TabDesign extends StatelessWidget {
  final String? title;

  TabDesign({this.title});

  @override
  Widget build(BuildContext context) {
    return Tab(
      child: Text(
        title!,
        style: Responsive.isDesktop(context)
            ? TextStyle(fontSize: 20)
            : Responsive.isTablet(context)
                ? TextStyle(fontSize: 18)
                : TextStyle(fontSize: 9),
      ),
    );
  }
}
