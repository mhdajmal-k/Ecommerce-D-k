const Wallet=require("../../model/wallet")
const {Transaction}=require("../../model/transaction")

 async function WalletCreationAndUpdating(user,totalAmount){
    console.log("hi");
    let UserWallet = await Wallet.findOne({ user: user });
      if (!UserWallet) {
        UserWallet = new Wallet({
          user: user,
          balance: totalAmount,
          transactions: [],
        });
      } else {
        UserWallet.balance += totalAmount;
      }
      const transaction = new Transaction({
        user: user,
        amount: totalAmount,
        type: "refund",
        description: "refund money for your return order",
      });
      UserWallet.transactions.push(transaction._id);
      await Promise.all([transaction.save(), UserWallet.save()]);
      console.log("set");
return true
 }


module.exports=WalletCreationAndUpdating
