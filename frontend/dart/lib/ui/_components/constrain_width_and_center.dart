import '../../nns_dapp.dart';

class ConstrainWidthAndCenter extends StatelessWidget {
  final double width;
  final Widget child;

  const ConstrainWidthAndCenter(
      {Key? key, this.width = 800, required this.child})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: width), child: child));
  }
}
