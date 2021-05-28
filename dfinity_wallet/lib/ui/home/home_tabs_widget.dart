// import 'package:core/core.dart';
// import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
// import 'package:dfinity_wallet/ui/_components/responsive.dart';
// import 'package:dfinity_wallet/ui/neurons/tab/neurons_tab_widget.dart';
// import 'package:dfinity_wallet/ui/proposals/governance_tab_widget.dart';
// import 'package:dfinity_wallet/ui/wallet/accounts_tab_widget.dart';
//
// import '../../dfinity.dart';
// import 'package:dfinity_wallet/ui/_components/responsive.dart';
//
// class HomePage extends StatefulWidget {
//   final int initialTabIndex;
//
//   const HomePage({Key? key, this.initialTabIndex = 0}) : super(key: key);
//
//   @override
//   _HomePageState createState() => _HomePageState();
// }
//
// class _HomePageState extends State<HomePage> {
//   @override
//   Widget build(BuildContext context) {
//     final screenSize = context.mediaQuery.size;
//     final tabSizeGrouping = AutoSizeGroup();
//     return DefaultTabController(
//       initialIndex: widget.initialTabIndex,
//       length: 4,
//       child: Scaffold(
//         backgroundColor: AppColors.lightBackground,
//         appBar: PreferredSize(
//           preferredSize: Size(screenSize.width, 160),
//           child: Stack(
//             children: [
//               SizedBox.expand(
//                   child: Image.asset(
//                 "assets/dfinity_gradient.jpg",
//                 fit: BoxFit.fill,
//               )),
//               AppBar(
//                 centerTitle: true,
//                 title: Padding(
//                   padding: const EdgeInsets.only(top: 4.0),
//                   child:
//                       // AutoSizeText(
//                       //   "NETWORK NERVOUS SYSTEM",
//                       //   maxLines: 1,
//                       //   style: TextStyle(
//                       //       fontSize: 24,
//                       //       color: AppColors.white,
//                       //       fontFamily: Fonts.circularMedium,
//                       //       letterSpacing: 4),
//                       // ),
//                       Responsive.isDesktop(context)
//                           ? Text(
//                               "NETWORK NERVOUS SYSTEM",
//                               style: TextStyle(
//                                   fontSize: 24,
//                                   color: AppColors.white,
//                                   fontFamily: Fonts.circularMedium,
//                                   letterSpacing: 4),
//                             )
//                           : Text(
//                               "NETWORK NERVOUS SYSTEM",
//                               style: TextStyle(
//                                   fontSize: 18,
//                                   color: AppColors.white,
//                                   fontFamily: Fonts.circularMedium,
//                                   letterSpacing: 4),
//                             ),
//                 ),
//                 actions: [
//                   Padding(
//                     padding: const EdgeInsets.all(8.0),
//                     child: TextButton(
//                       child: Text(
//                         "Logout",
//                         style: TextStyle(color: AppColors.white),
//                       ),
//                       onPressed: () async {
//                         context.icApi.logout();
//                       },
//                     ),
//                   )
//                 ],
//                 backgroundColor: Colors.transparent,
//                 shadowColor: Colors.transparent,
//                 bottom: PreferredSize(
//                   preferredSize: Size(screenSize.width, 150),
//                   child: Container(
//                     color: Color(0xff0B0C0C),
//                     child: Padding(
//                       padding: const EdgeInsets.all(16.0),
//                       child: Container(
//                         decoration: BoxDecoration(
//                             color: Color(0xff282A2D),
//                             borderRadius: BorderRadius.circular(16)),
//                         child: TabBar(
//                           indicator: BoxDecoration(
//                               color: Color(0xff0081FF),
//                               borderRadius: BorderRadius.circular(16)),
//                           indicatorSize: TabBarIndicatorSize.tab,
//                           labelPadding: EdgeInsets.symmetric(
//                               vertical: 15, horizontal: 10),
//                           unselectedLabelColor: AppColors.gray400,
//                           labelColor: AppColors.white,
//                           labelStyle: TextStyle(
//                               fontFamily: Fonts.circularMedium,
//                               fontSize: 20,
//                               letterSpacing: 1.2),
//                           tabs: [
//                             Tab(
//                                 child: AutoSizeText(
//                               "ICP",
//                               group: tabSizeGrouping,
//                               maxLines: 1,
//                             )),
//                             Tab(
//                                 child: AutoSizeText(
//                               "NEURONS",
//                               group: tabSizeGrouping,
//                               maxLines: 1,
//                             )),
//                             Tab(
//                                 child: AutoSizeText(
//                               "VOTING",
//                               group: tabSizeGrouping,
//                               maxLines: 1,
//                             )),
//                             Tab(
//                                 child: AutoSizeText(
//                               "CANISTERS",
//                               group: tabSizeGrouping,
//                               maxLines: 1,
//                             )),
//                           ],
//                         ),
//                       ),
//                     ),
//                   ),
//                 ),
//               ),
//             ],
//           ),
//         ),
//         body: SizedBox.expand(
//           child: TabBarView(
//             children: [
//               AccountsTabWidget(),
//               NeuronsPage(),
//               GovernanceTabWidget(),
//               CansitersPage()
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

import 'package:core/core.dart';
import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/neurons/tab/neurons_tab_widget.dart';
import 'package:dfinity_wallet/ui/proposals/governance_tab_widget.dart';
import 'package:dfinity_wallet/ui/wallet/accounts_tab_widget.dart';

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
    final tabSizeGrouping = AutoSizeGroup();
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
                                ? TextStyle(
                                    color: AppColors.white, fontSize: 18)
                                : TextStyle(
                                    color: AppColors.white, fontSize: 9),
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
                      child: Container(
                        decoration: BoxDecoration(
                            color: Color(0xff282A2D),
                            borderRadius: BorderRadius.circular(16)),
                        child: TabBar(
                          indicator: BoxDecoration(
                              color: Color(0xff0081FF),
                              borderRadius: BorderRadius.circular(8)),
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
