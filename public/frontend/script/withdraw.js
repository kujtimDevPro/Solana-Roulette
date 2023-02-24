$("#withdraw_coin").keydown(function (e) {
  var invalidChars = [
    "-",
    "+",
    "e",
  ];

  if (invalidChars.includes(e.key)) {
    e.preventDefault();
  }
  
});

async function validateNConnect() {
  const isPhantomInstalled = window.solana && window.solana.isPhantom;
  if (isPhantomInstalled) {
    await window.solana.connect();
  } else {
    window.alert("solana object not found! get a phantom wallet");
    window.location = "https://www.phantom.app/";
  }
}

$(".coin_withdraw_btn").click(async function () {
  console.log('withdraw')
  if (disable) {
    $.toast({
      heading: "Error",
      text: "You already sent request. Please wait until server confirm your request.",
      position: "top-right",
      icon: "error",
    });
  } else {
    await validateNConnect();
    const provider = window.solana;
    let minDepAmt = 0.05;
  
    var coin = $("#withdraw_coin").val();
    let userWalletPubKey = provider.publicKey.toString();
  
    if(parseFloat(coin)>parseFloat(usrCurntBal)){
      $.toast({
        heading: "Error",
        text: "Withdraw amount is greater than your current balance",
        position: "top-right",
        icon: "error",
      });
    }else if (parseFloat(coin) >= minDepAmt) {
      if (
        userId !== "" &&
        userId !== 0 &&
        userId !== null &&
        userId !== undefined
      ) {
        if (userWalletPubKey) {
          $.toast({
            heading: "success",
            text: "Withdraw request sent. Please Wait a minute",
            position: "top-right",
            icon: "success",
          });
          disable = true
          $.ajax({
            type: "POST",
            dataType: "json",
            url: baseUrl + "withdraw/sendPayment",
            data: {
              amount: coin,
              user_id: userId,
              userWalletPubKey: userWalletPubKey,
            },
            success:async function (response) {
              console.log(response)
              if (response.status === "success") {
                console.log('successfull call')
                  $.toast({
                  heading: "success",
                  text: response.message,
                  position: "top-right",
                  icon: "success",
                });
                setTimeout(function(){ 
                  disable = false             
                  window.location.reload();
                }, 3000); 
              } else {
                console.log(' failed calling successfull')
                $.toast({
                  heading: "Error",
                  text: response.message,
                  position: "top-right",
                  icon: "error",
                });
              }
  
            },
          });
        } else {
          console.log(' userWalletPubKey err')
          disable = false
          $.toast({
            heading: "Error",
            text: "Wallet info not found",
            position: "top-right",
            icon: "error",
          });
        }
      }
    } else {
      disable = false
      $.toast({
        heading: "Error",
        text: `Minimum Withdraw amount is ${minDepAmt} SOL.`,
        position: "top-right",
        icon: "error",
      });
    }
  }
});
