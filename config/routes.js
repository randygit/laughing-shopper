var async = require('async');

module.exports = function(app, passport, auth) {

    //Front End Routes

    var about = require('../app/controllers/about');
    app.get('/about', auth.requiresLogout, about.about);
    app.get('/faq', auth.requiresLogout, about.faq);
    app.get('/terms', auth.requiresLogout, about.terms);


    var contact = require('../app/controllers/contact');
    app.get('/contact', auth.requiresLogout, contact.render);

    var profile = require('../app/controllers/profile');


    //User Routes
    var users = require('../app/controllers/users');

    // user must not be logged in for the following operations
    // if logged in they will be redirected to '/'
    // auth.requiresLogin and Logout are defined in /config/middleware/authoriztion.js

    app.get('/login',  auth.requiresLogout, users.login);
    app.get('/signup', auth.requiresLogout, users.signup);
    app.get('/forgot', auth.requiresLogout, users.forgot);

    app.get('/reset',   auth.requiresLogin, users.reset);
    app.get('/signout', auth.requiresLogin, users.signout);

    //app.get('/resetpassword', auth.requiresLogin, users.resetpassword);

    // edit user profile

    app.get('/user/profile/:email', users.getProfile);
    app.post('/user/profile/:email', users.updateProfile);

    app.post('/user/password/:email', users.updatePassword);


    // validation for directives
    app.post('/validate/username/:email', users.validateUsername);
    app.post('/validate/password/:email', users.validatePassword);

    app.post('/verify/email',    users.verifyEmail);
    app.post('/verify/username', users.verifyUsername);




    // CONTACT MESSAGE
    // 1. app.get('/contact', auth.requiresLogout, contact.render);
    // 2. app.post('/contact/sendemail', contact.sendemail);


    // send contact message to admin. triggered by contact.jade and controller
    app.post('/contact/sendemail', contact.sendemail);


    // LOGIN
    // 1. app.get('/login',  auth.requiresLogout, users.login);
    // 2. app.post('/user/sessions', passport.authenticate('local', {}))
    // 3.  app.get('/welcome', auth.requiresLogin, users.welcome);

    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Invalid email or password.'
    }), users.session);


    app.get('/welcome', auth.requiresLogin, users.welcome);



    // SIGNUP PROCESS
    // 1. on click signup,                        app.get('/signup', auth.requiresLogout, users.signup);
    //      render views/users/signup.jade
    // 2. on submit from views/users/signup.jade  app.post('/signup', users.create);
    //    send error message if any username or email is already used
    //    create a new user, save
    //    create token
    //    send email
    // 3. on click from email,                    app.get('/verify/user/confirm/:token', verificationtoken.checkNewUserToken);
    //    check if user is not verified
    //    check if token has not expired?
    //    render views/verify/newuser
    // 4. on submit from views/verify/newuser      app.get('/verify/newuser/:token', verificationtoken.verifyNewUser);
    //    update user.verified = true;
    //    send thank you email
    //    redirect to '/login'

    app.post('/signup', users.create);


    //Verify token route from email link
    var verificationtoken = require('../app/controllers/verificationtoken');
    //app.get('/verify/:token', verificationtoken.checkNewUserToken);

    // show view, ask user to click button to confirm. redirects to /verify/newuser/:token

    app.get('/verify/user/confirm/:token', verificationtoken.checkNewUserToken);


    // from view/verify/newuser
    app.get('/verify/newuser/:token', verificationtoken.verifyNewUser);


    // FORGOT PASSWORD PROCESS
    // 1. on click forgot,                        app.get('/forgot', auth.requiresLogout, users.forgot);
    //      render views/users/forgot.jade
    // 2. on submit from views/users/forgot.jade  app.post('/forgot', users.passwordRequest);
    //    send email is not in database
    //    create token
    //    send email
    // 3. on click from email,                    app.get('/verify/forgotpassword/confirm/:token', verificationtoken.checkToken);
    //    check if token has not been used
    //    check if token has not expired?
    //    render views/verify/newpassword -- see views/users/reset.jade
    // 4. on submit from views/verify/newpassword      app.get('/verify/password/:token', verificationtoken.verifyUser);
    //    save password user.save
    //    update token.used = true;
    //    send thank you email



    // 2. from views/user/forgot.jade
    app.post('/forgot', users.passwordForgotRequest);

    // 3. Verify token route from email link
    var forgotpasswordtoken = require('../app/controllers/forgotpasswordtoken');
    app.get('/verify/forgotpassword/confirm/:token', forgotpasswordtoken.checkForgotPasswordToken);


    // 4. from view/verify/forgotpassword for the given user
    // is it safe to pass the password without being encrypted
    //app.post('/verify/password/:email/:token', forgotpasswordtoken.verifyForgotPassword);
    app.post('/verify/password/:email', forgotpasswordtoken.verifyForgotPassword);


    var emailer = require('../app/controllers/massmailer');
    app.post('/sendformmail', emailer.sendFormMail);


    var staticData = require('../app/controllers/static');
    app.get('/getdata/countries', staticData.getCountries);
    app.get('/getdata/roles', staticData.getRoles);

    /*
    // test routines
    var testing = require('../app/controllers/testingcontroller');
    app.get('/editform', auth.requiresLogin, testing.editform);
    app.post('/updateform', auth.requiresLogin, testing.updateform);

    app.get('/readtestdata/:email',  testing.readtestdata);
    app.get('/picture', auth.requiresLogin, testing.picture);
    */

    //support
    var support = require('../app/controllers/support');
    app.get('/support',              support.general);
    app.get('/support/notmyaccount', support.notmyaccount);
    app.get('/support/compromised',  support.compromised);

    // user roles
    var roles = require('../app/controllers/userroles');
    app.get('/api/roles', roles.users);             // get all users
    app.get('/api/role/:id', roles.user);           // get a user
    app.post('/api/role/:id', roles.edit);           // update user

    // contacts
    var contacts = require('../app/controllers/contacts');
    app.get('/api/contacts', contacts.contacts);      // get all contacts
    app.get('/api/contact/:id', contacts.contact);    // get a contact
    app.post('/api/contact', contacts.add);           // save contact
    app.put('/api/contact/:id', contacts.edit);       //edit&update contact
    app.delete('/api/contact/:id', contacts.delete);   //delete contact

    // products
    var products = require('../app/controllers/products');
    app.get('/api/products', products.products);      // get all products
    app.get('/api/product/:id', products.product);    // get a product
    app.post('/api/product', products.add);           // save product
    app.put('/api/product/:id', products.edit);       //edit&update product
    app.delete('/api/product/:id', products.delete);   //delete product

    app.get('/api/forsale', products.forsale);      // get all for sale products
    app.get('/api/productdetails/:manufacturersName', products.details);   // get all products for same manu name

    // shoppingCart

    var cart = require('../app/controllers/cart');
    app.get('/api/shoppingCart/:email', cart.items);      // get all items
    app.post('/api/shoppingCart', cart.add);              // save product
    app.get('/api/summarizeCart/:email', cart.summary);
    app.delete('/api/shoppingCart/:id', cart.delete);     //delete product
    app.put('/api/clearCart/:email', cart.clear);    //clear shopping cart
    app.put('/api/shoppingCart/:id', cart.edit);      //edit&update product

    // orders
    var order = require('../app/controllers/orders');
    app.post('/api/order', order.add);             // add order
    app.get('/api/order/:id', order.order);        // get order info

    app.get('/api/getWuCount/:email', order.getWuCount);
    app.get('/api/getWuTransactions/:email', order.wuOrders);
    app.put('/api/wuOrder/:id', order.wuOrder);
    app.get('/api/verifyWuOrders', order.verifyWuOrders);
    app.put('/api/verifyWuOrder/:id', order.verifyWuOrder);
    app.put('/api/disapproveWuOrder/:id', order.disapproveWuOrder);
    app.get('/api/packingList', order.packingList);
    app.get('/api/postedShipment', order.postedShipment);

    // packingLists
    var packingList = require('../app/controllers/packingList');
    app.post('/api/packingList'         ,packingList.add);          // add to packinglist, update Order
    app.get('/api/packingLists/:orderId',packingList.list);         // list all packingList
    app.post('/api/cancelPackingList'  ,packingList.cancel);        // cancel packing and update Order
    app.post('/api/shipPackingList'    ,packingList.ship);          // add shipment, update packingList,Order


    // shipments
    var shipment = require('../app/controllers/shipment');
    //app.get('/api/shipment/:email/:status', shipment.shipments);      // get all items


    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);
};
