import 'package:core/core.dart';

class LandingPageWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.black,
      child: Stack(
        children: [
          SizedBox.expand(
              child: FractionallySizedBox(
                  widthFactor: 0.3,
                  heightFactor: 0.3,
                  child: SizedBox.expand(
                      child: SvgPicture.asset("assets/dfinity_logo.svg")))),
        ],
      ),
    );
  }
}
