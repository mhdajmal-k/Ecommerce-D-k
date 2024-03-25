const Wallet=require("../model/wallet")
const {Transaction}= require("../model/transaction");
const User = require("../model/user_model");
const Razorpay = require("razorpay");
const crypto = require("crypto");


const razorpayInstance = new Razorpay({
    key_id: process.env.RazorPayId,
    key_secret: process.env.RazorPaySecret,
  });
  


const load_wallet = async (req, res) => {
    try {
        console.log("hi");
        const { userId } = req.session;
        console.log(userId);
        const userData = await User.findById(userId);
       

            const wallet=await Wallet.findOne({user:userId}).populate("transactions")
            if(wallet){
            console.log(wallet,"its wallet");
            const walletDataTransaction=wallet.transactions.slice(-2)
            console.log(walletDataTransaction,"ITS WALLET DATATRANCATION");
            res.render("wallet", { userData, walletData:wallet,transactions:walletDataTransaction });
        }else{
            res.render("wallet",{userData})
        }
    } catch (error) {
        console.log(error);
    }
};

const addToWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const numericAmount = parseFloat(amount);
        console.log(numericAmount);
        if (isNaN(numericAmount)) {
            return res.json({ status: "invalid amount" });
        }
        if (numericAmount > 5000 || numericAmount < 0) {
            return res.json({ status: "maximum add limit exceeded" });
        }
        const generateRazor = await generateRazorPay(numericAmount);
        if (generateRazor) {
            console.log("sdhbfiushifhishf");
            return res.json({ status: "razorPay", generateRazorPayOrder:generateRazor,amount:numericAmount });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to add amount to wallet" });
    }
};

function generateRazorPay(numericAmount) {
    return new Promise((resolve, reject) => {
        const options = {
            amount: numericAmount * 100, 
            currency: "INR",
        };
        razorpayInstance.orders.create(options, (err, order) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(order, "its order");
                resolve(order);
            }
        });
    });
}



  const walletRazorPayVerify= async (req, res) => {
    try {
   const {amount}=req.body
  const walletAmount=amount/100
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body.response;
  
      let hmac = crypto.createHmac("sha256", "1K3dgR8PXdK42NNRMYbicrrB");
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      hmac = hmac.digest("hex");
      if (hmac === razorpay_signature) {
        const { userId } = req.session;
     
            let checkingUserWallet = await Wallet.findOne({ user: userId });
            if (!checkingUserWallet) {
                const userWallet = new Wallet({
                    user: userId,
                    balance: 0 
                });
                await userWallet.save();
                checkingUserWallet = userWallet;
            }
            const transaction = new Transaction({
                user: userId,
                amount: walletAmount, 
                type: "Online Payment",
                description: "Add money through Razorpay"
            });
            await transaction.save();
            checkingUserWallet.transactions.push(transaction._id);
            checkingUserWallet.balance += walletAmount; 
            await checkingUserWallet.save();
            res.json({ status: true });
        } else {
        res.json({ status: false, err });
      }
    } catch (error) {
      console.log(error.message);
    }
  };


module.exports = {
    load_wallet,
    addToWallet,
    walletRazorPayVerify
};
