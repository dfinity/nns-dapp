import '../dfinity.dart';

abstract class AbstractPlatformICApi extends State<ICApiManager> {
    void authenticate(BuildContext context);
    Future<void> buildServices(BuildContext context);
    Future<void> acquireICPTs(String accountIdentifier, BigInt doms);
    Future<void> createSubAccount(String name);
    Future<void> sendICPTs(String toAccount, double icpts, String fromSubAccount);

    @override
    Widget build(BuildContext context) {
        return InternetComputerApiWidget(child: widget.child, icApi: this);
    }
}