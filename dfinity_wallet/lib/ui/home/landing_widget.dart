import 'package:core/core.dart';

class LandingPageWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
    SizedBox.expand(
      child: Image.asset(
        "assets/faded_circles_bg.jpg",
        fit: BoxFit.cover,
      ),
    ),
    SizedBox.expand(
        child: FractionallySizedBox(
            widthFactor: 0.3,
            heightFactor: 0.3,
            child: SizedBox.expand(child: SvgPicture.asset("assets/dfinity_logo.svg")))),
      ],
    );
  }
}


