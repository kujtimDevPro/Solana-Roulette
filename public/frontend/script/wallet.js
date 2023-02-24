$("#deposit_coin").keydown(function (e) {
  var invalidChars = [
    "-",
    "+",
    "e",
  ];
  if (invalidChars.includes(e.key)) {
    e.preventDefault();
  }
});

$("#deposit_coin").keyup(async function (e) {
  let depositTbVal=$("#deposit_coin").val()
  if(depositTbVal){
    depositTbVal=parseFloat(depositTbVal).toFixed(4)
    $('.price').text(depositTbVal +' SOL')
  }else{
    $('.price').text('')
  }
});

// Function to actually do the connection to the wallet
async function connectAndSend() {
  try {
    await window.solana.connect();
    await sendSol();
  } catch (err) {}
}

// Function to create button and on click
function validateAc() {

  const isPhantomInstalled = window.solana && window.solana.isPhantom;

  if (isPhantomInstalled == true) {
    let sendSoulBtn = document.getElementById("coinDepositBtn");
    sendSoulBtn.addEventListener("click", connectAndSend);
  } else {
    window.alert("solana object not found! get a phantom wallet");
    window.location = "https://www.phantom.app/";
  }
}

// On load of page check to see if there is a phantom window object if not then have popup
window.addEventListener("load", validateAc);

async function sendSol() {
  console.log(adminWallet)
  const provider = window.solana;
  const toAddr = adminWallet;
  const price = document.getElementById("deposit_coin").value;
  let userWalletAddress= provider.publicKey.toString()
  let minDepAmt = 0.05;

  let transaction_block;
  let transaction_signature;

  if (parseFloat(price) >= minDepAmt) {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl(walletClusterApiUrl),
      "confirmed"
    );
    const toAccount = new solanaWeb3.PublicKey(toAddr);
    // Create transaction object
    let transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: toAccount,
        lamports: solanaWeb3.LAMPORTS_PER_SOL * price,
      })
    );
    // Setting the variables for the transaction
    transaction.feePayer = await provider.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    // Transaction constructor initialized successfully
    if (transaction) {
      console.log("Txn created successfully");
    } else {
      console.log("Txn created unsuccessfully");
    }

    // Request creator to sign the transaction (allow the transaction )
    let signed = await provider.signTransaction(transaction).then(
      (data) => {
        console.log('signTransaction==> ', data);
        return data;
      },
      (reject) => {
        $.toast({
          heading: "Failed",
          text: "User declined transaction.",
          position: "top-right",
          icon: "error",
        });
        // console.log(reject);
      }
    );
    // console.log('signed => ',signed)
    let signature = await connection
      .sendRawTransaction(signed.serialize())
      .then(
        (data) => {
          transaction_signature=data;
          console.log('sendRawTransaction==> ',data);
          return data;
        },
        (reject) => {
          $.toast({
            heading: "Failed",
            text: "Insufficient balance in Phantom wallet.",
            position: "top-right",
            icon: "error",
          });
        }
      );
    if(signature){
      await connection.confirmTransaction(signature).then(
        (data) => {
          console.log('confirmTransaction==> ',data);
          transaction_block=data.context.slot;
          $.ajax({
            type: "POST",
            dataType: "json",
            url: baseUrl + "deposit/paymentsuccess",
            data: {
              transaction_block: transaction_block,
              transaction_signature: transaction_signature,
              coin: price,
              price: price,
              userWalletAddress: userWalletAddress,
            },
            success: function (response) {
              $.toast({
                heading: response.status,
                text: response.message,
                position: "top-right",
                icon: "success",
              });
            },
          });
          return data;
        },
        (reject) => {
          $.toast({
            heading: "Failed",
            text: "Transaction confirmation failed.",
            position: "top-right",
            icon: "error",
          });
        }
      );
    }
  } else {
    $.toast({
      heading: "Error",
      text: `Minimum deposit amount is ${minDepAmt} solona`,
      position: "top-right",
      icon: "error",
    });
  }
}
