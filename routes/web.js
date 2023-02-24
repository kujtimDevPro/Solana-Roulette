const { check, validationResult } = require('express-validator/check');
var jwt = require('jsonwebtoken');

// const config = require('../../casinc-roulleete-dev/config/constants.js');
const config = require('../config/constants.js');
module.exports = function (app, model, controller) {
    /* var middleware = require('../../casinc-roulleete-dev/app/middleware/index')(model);
    var validation = require('../../casinc-roulleete-dev/app/validator/index')(model); */
    var middleware = require('../app/middleware/index')(model);
    var validation = require('../app/validator/index')(model);
    
    app.get('/', controller.roulette.view);
    app.post('/login', middleware.auth.isLogin , controller.auth.login)
   	app.get('/logout', controller.auth.logout)
   	// app.get('/profile/userchatdelete/:id',middleware.auth.login, controller.profile.userchatdelete);
   	// app.get('/profile',middleware.auth.login, controller.profile.view);
    app.post('/save',middleware.auth.login, controller.profile.save);

    // deposite coin add
    app.get('/deposit', middleware.auth.login, controller.deposit.view);	//deposit view
    app.post('/deposit/paymentsuccess', middleware.auth.login, controller.deposit.paymentsuccess);


    app.get('/withdraw', middleware.auth.login, controller.withdraw.view);    //withdraw view
    app.post('/withdraw/checkcoin', controller.withdraw.checkcoin);   //withdraw coin check amount
    app.post('/withdraw/coin', middleware.auth.login, controller.withdraw.create);    //withdraw coin add

    /*Free-Kassa routs */
    app.get('/deposit/GetDepositeForm', controller.deposit.GetDepositeForm);
    app.post('/withdraw/sendPayment', middleware.auth.login, controller.withdraw.sendPayment);
    app.get('/paymentfail', controller.deposit.paymentfail);
    app.post('/freekassaalert', controller.deposit.freekassaalert);
    app.post('/paymentsuccess', controller.deposit.paymentsuccess);

    app.get('/deposit/getDeposits', middleware.auth.login, controller.deposit.getDeposits);
    app.get('/withdraw/getWithdraws', middleware.auth.login, controller.withdraw.getWithdraws);
}
