import '../../dfinity.dart';

class FooterGradientButton extends StatelessWidget {
  final Widget footer;
  final Widget body;
  final double? footerHeight;

  const FooterGradientButton({Key? key, required this.footer, required this.body, this.footerHeight = 100})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        body,
        IgnorePointer(
          child: SizedBox.expand(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment(0.0, 0.5), // 10% of the width, so there are ten blinds.
                  colors: <Color>[Colors.black, AppColors.transparent], // red to yellow
                  tileMode: TileMode.clamp, // repeats the gradient over the canvas
                ),
              ),
            ),
          ),
        ),
        SizedBox.expand(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: SizedBox(
              width: double.infinity,
              height: footerHeight,
              child: footer,
            ),
          ),
        )
      ],
    );
  }


}
