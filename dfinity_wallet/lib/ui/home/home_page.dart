import 'package:core/widget_forces/force_layout.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:core/core.dart';
import 'home_tabs_widget.dart';
import 'landing_widget.dart';

class HomePageContainer extends StatefulWidget {
  HomePageContainer({Key? key}) : super(key: key);

  @override
  _HomePageContainer createState() => _HomePageContainer();
}

class _HomePageContainer extends State<HomePageContainer> {
  bool landingPageVisible = true;
  bool landingPageAnimating = false;
  Duration animationDuration = 0.5.seconds;

  @override
  void initState() {
    super.initState();
    2.seconds.delay.then((value) async {
      setState(() {
        landingPageVisible = false;
        landingPageAnimating = true;
      });
      await animationDuration.delay;
      setState(() {
        landingPageAnimating = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (!landingPageVisible) HomeTabsWidget(),
        if (landingPageAnimating || landingPageVisible)
          AnimatedOpacity(duration: animationDuration, opacity: landingPageVisible ? 1 : 0, child: LandingPageWidget()),
      ],
    );
  }
}
