CREATE PRODUCT
  db.products.insert({
    sku: "111445GB3",
    title: "Simsong One mobile phone",
    description: "The greatest Onedroid phone on the market .....",

    manufacture_details: {
      model_number: "A123X",
      release_date: new ISODate("2012-05-17T08:14:15.656Z")
    },

    shipping_details: {
      weight: 350,
      width: 10,
      height: 10,
      depth: 1
    },

    quantity: 99,

    pricing: {
      price: 1000
    }
  })
  
CREATE CART
  db.carts.insert({
   _id: "the_users_session_id",
   status:'active',
   quantity: 2,
   total: 2000,
   products: []});
   
ADD ITEMS TO CART
 db.carts.update({
     _id: "the_users_session_id", status:'active'
   }, {
     $set: { modified_on: ISODate() },
     $push: {
       products: {
         sku: "111445GB3", quantity: 1, title: "Simsong One mobile phone", price:1000
       }
     }
   });
   
   
Then, check to ensure that the inventory can support adding the product to the customers cart:
make sure you have quantity > cart.products.qty entered by user

    db.products.update({
     sku: "111445GB3", quantity: {$gte: 1}
   }, {
     $inc: {quantity: -1},
     $push: {                       // save into in_carts[{'quantity':Number, 'id':'user_session_id', timestamp: ISODate()}]
       in_carts: {
         quantity:1, id: "the_users_session_id", timestamp: new ISODate()
       }
     }
   })
   
This operation only succeeds if there is sufficient inventory, and the application must detect the operation's success or failure. Call getLastError to fetch the result of the attempted update:
   
   if(!db.runCommand({getLastError:1}).updatedExisting) {
   db.carts.update({
       _id: "the_users_session_id"
     }, {
       $pull: {products: {sku:"111445GB3"}}     // delete record from cart.products
   }

If updatedExisting is false in the resulting document, the operation failed and the application must "roll back" the attempt to add the product to the users cart. This pattern ensures that the application cannot have more products in carts than the available inventory.

EDIT QTY IN CART

var new_quantity = 2;
var old_quantity = 1;
var quantity_delta = new_quantity - old_quantity;
// look for the particular product in products[] using products.sku

db.carts.update({
    _id: "the_users_session_id", "products.sku": "111445GB3", status: "active"    //products[{sku: Number, quantity: Number, 
                                                                                  // title: String, price:Number}]
  }, {
    $set: {
      modified_on: new ISODate(),
      "products.$.qty": new_quantity
  }
})

Now, remove the additional item from the inventory update the number of items in the shopping cart:

// locate record in in_carts[{'quantity':Number, 'id':'user_session_id', timestamp: ISODate()}]

  db.products.update({
     sku: "111445GB3",
     "in_carts.id": "the_users_session_id",
     quantity: {
       $gte: 1
     }
   }, {
     $inc: { quantity: (-1)*quantity_delta },
     $set: {
       "in_carts.$.quantity": new_quantity, timestamp: new ISODate()
     }
   })
   
Ensure the application has enough inventory for the operation. If there is not sufficient inventory, the application must rollback the last operation. The following operation checks for errors using getLastError and rolls back the operation if it returns an error:

 if(!db.runCommand({getLastError:1}).updatedExisting) {
   db.carts.update({
       _id: "the_users_session_id", "products.sku": "111445GB3"
     }, {
       $set : { "in_carts.$.quantity": old_quantity}
     })
 }
 
 
FOR EXPIRED CARTS. return quantity to products, set cart status to EXPIRED

 var carts = db.carts.find({status:"expiring"})
 for(var i = 0; i < carts.length; i++) {
   var cart = carts[i]

  // many carts could be expiring
  
   for(var j = 0; j < cart.products.length; j++) {
     var product = cart.products[i];        //prodcts are cart.products[]

     db.products.update({
         sku: product.sku,
         "in_carts.id": cart._id,           // SELECT products where sku: 'product.sku' and 'in_carts[] record 
                                            // contains the session id
         "in_carts.quantity": product.quantity
       }, {
         $inc: {quantity: item.quantity},       // increment quantity cart qty by product.quantity not item.quantity
         $pull: {in_carts: {id: cart._id}}      // delete in_cart record
       })
   }

   db.carts.update({
       _id: cart._id,
       $set: {status: 'expired'}
     })
 }

CHECKOUT
 db.orders.insert({
   created_on: new ISODate("2012-05-17T08:14:15.656Z"),

   shipping: {
     customer: "Peter P Peterson",
     address: "Longroad 1343",
     city: "Peterburg",
     region: "",
     state: "PE",
     country: "Peteonia",
     delivery_notes: "Leave at the gate",

     tracking: {
       company: "ups",
       tracking_number: "22122X211SD",
       status: "ontruck",
       estimated_delivery: new ISODate("2012-05-17T08:14:15.656Z")
     },
   },

   payment: {
     method: "visa",
     transaction_id: "2312213312XXXTD"
   }

   products: {
     {quantity: 2, sku:"111445GB3", title: "Simsong mobile phone", unit_cost:1000, currency:"USDA"}
   }
 }
 
Using MongoDB one can create a single document that is self-contained, easy to understand, and simply maps into an object oriented application. After inserting the this document the application must ensure inventory is up to date before completing the checkout. Begin by setting the cart as finished, with the following operation:

  db.carts.update({
     _id: "the_users_session_id"
   }, {
     $set: {status:"complete"}
   });

Use the following operation to remove the in_cart records for given users_session_id from all product records:

  db.products.update({
     "in_carts.id": "the_users_session_id"
   }, {
     $pull: {in_carts: {id: "the_users_session_id"}}
   }, false, true);
   
By using "multi-update," which is the last argument in the update() method, this operation will update all matching documents in one set of operations.
   

