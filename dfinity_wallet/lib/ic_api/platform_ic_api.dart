
import '../dfinity.dart';

abstract class AbstractPlatformICApi extends State<ICApiManager> {
    void authenticate(BuildContext context);
    Future<void> buildServices(BuildContext context);

    @override
    Widget build(BuildContext context) {
        return InternetComputerApiWidget(child: widget.child, icApi: this);
    }
}