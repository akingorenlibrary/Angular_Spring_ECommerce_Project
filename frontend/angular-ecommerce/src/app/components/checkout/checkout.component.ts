import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup:FormGroup;
  totalPrice:number=0;
  totalQuantity:number=0;
  
  creditCardYears:number[]=[];
  creditCardMonths:number[]=[];
  
  countries:Country[]=[];
  shippingAddressStates:State[]=[];
  billingAddressStates:State[]=[];

  storage:Storage=sessionStorage;

  stripe=Stripe(environment.stripePublishableKey);
  paymentInfo:PaymentInfo=new PaymentInfo();
  cardElement:any;
  displayError:any="";

  isDisable:boolean=false;

  constructor(
    private formBuilder:FormBuilder,
    private luv2ShopFormService:Luv2ShopFormService,
    private cartService:CartService,
    private checkoutService:CheckoutService,
    private router:Router
  ) { }

  ngOnInit(): void {

    this.setupStripePaymentForm();

    this.reviewCartDetails();

    const theEmail=JSON.parse(this.storage.getItem("userEmail"));

    this.checkoutFormGroup=this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName:new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName:new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        //email:new FormControl('',[Validators.required, Validators.pattern('^[a-z09._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
        email:new FormControl(theEmail,[Validators.required])
      }),
      shippingAdress:this.formBuilder.group({
        street:new FormControl('',[Validators.required, Luv2ShopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required, Luv2ShopValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      billingAddress:this.formBuilder.group({
        street:new FormControl('',[Validators.required, Luv2ShopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required, Luv2ShopValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      creditCard:this.formBuilder.group({
        /*
        cartType:new FormControl('',[Validators.required]),
        nameOnCard:new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',[Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:['']
        */
      })
    });

    /*
    //Populate credit card months
    const startMonth:number=new Date().getMonth()+1;
    //console.log("startMonth: ",startMonth);
    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(data=>{
      //console.log("gelenay: "+JSON.stringify(data));
      this.creditCardMonths=data;
    });

    this.luv2ShopFormService.getCreditCardYear().subscribe(data=>{
      //console.log("gelenyii: ",JSON.stringify(data));
      this.creditCardYears=data;
    });
    */

    this.luv2ShopFormService.getCountries().subscribe(
      data=>{
        //console.log("data: ",data);
        this.countries=data;
      }
    );
  }

  //
  get firstName(){
    return this.checkoutFormGroup.get("customer.firstName");
  }

  get lastName(){
    return this.checkoutFormGroup.get("customer.lastName");
  }

  get email(){
    return this.checkoutFormGroup.get("customer.email");
  }

  //
  get shippingAddressStreet(){
    return this.checkoutFormGroup.get("shippingAdress.street");
  }

  get shippingAddressCity(){
    return this.checkoutFormGroup.get("shippingAdress.city");
  }
  
  get shippingAddressState(){
    return this.checkoutFormGroup.get("shippingAdress.state");
  }
  
  get shippingAddressZipCode(){
    return this.checkoutFormGroup.get("shippingAdress.zipCode");
  }

  get shippingAddressCountry(){
    return this.checkoutFormGroup.get("shippingAdress.country");
  }

  //
  get billingAddressStreet(){
    return this.checkoutFormGroup.get("billingAddress.street");
  }

  get billingAddressCity(){
    return this.checkoutFormGroup.get("billingAddress.city");
  }
  
  get billingAddressState(){
    return this.checkoutFormGroup.get("billingAddress.state");
  }
  
  get billingAddressZipCode(){
    return this.checkoutFormGroup.get("billingAddress.zipCode");
  }

  get billingAddressCountry(){
    return this.checkoutFormGroup.get("billingAddress.country");
  }

  //
  get creditCartType(){
    return this.checkoutFormGroup.get("creditCard.cartType");
  }

  get creditCartNameOnCard(){
    return this.checkoutFormGroup.get("creditCard.nameOnCard");
  }

  get creditCartNumber(){
    return this.checkoutFormGroup.get("creditCard.cardNumber");
  }

  get creditCartSecurityCode(){
    return this.checkoutFormGroup.get("creditCard.securityCode");
  }

  onSubmit(){
    console.log("submit oldu");
    
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order=new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;

    const cartItem=this.cartService.cartItems;

    let orderItems:OrderItem[]=[];
    for(let i=0;i<cartItem.length;i++){
      orderItems[i]=new OrderItem(cartItem[i]);
    }

    let orderItemsShort:OrderItem[]=cartItem.map(tempCartItem => new OrderItem(tempCartItem));
   
    let purchase=new Purchase();

    purchase.customer=this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAdress'].value;
    const shippingState:State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry:Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;


    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState:State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry:Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;


    purchase.order=order;
    purchase.orderItems=orderItems;

    this.paymentInfo.amount=Math.round(this.totalPrice*100); //12.54 dolar *10 => 1254 cent
    this.paymentInfo.currency="USD";
    this.paymentInfo.receiptEmail=purchase.customer.email;

    if(!this.checkoutFormGroup.invalid && this.displayError.textContent===""){

      this.isDisable=true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse)=>{
          this.stripe.confirmCardPayment(
            paymentIntentResponse.client_secret,
            {
              payment_method:{
                card:this.cardElement,
                billing_details:{
                  email:purchase.customer.email,
                  name:`${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address:{
                    line1:purchase.billingAddress.street,
                    city:purchase.billingAddress.city,
                    state:purchase.billingAddress.state,
                    postal_code:purchase.billingAddress.zipCode,
                    country:this.billingAddressCountry.value.code
                  }
                }
              }
            },{
              handleActions:false
            }
            )
            .then((result:any)=>{
              if(result.error){
                alert("There was an error: "+result.error.message);
                this.isDisable=false;
              }else{
                this.checkoutService.placeOrder(purchase).subscribe({
                  next:(response:any)=>{
                    alert(`Your order has been received. \n Order tracking number: ${response.orderTrackingNumber}`);
                    this.resetCart();
                    this.isDisable=false;
                  },error:(err:any)=>{
                    alert(`There was an error: ${err.message}`);
                    this.isDisable=false;
                  }
                });
              }
            })
        }
      );
    }else{
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    /*
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next:response=>{
          alert(`Ypur order has been received.\n Order tracking number: ${response.orderTrackingNumber}`);
          this.resetCart();
        },
        error:err=>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );
    */

  }

  resetCart(){
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears(){
    const creditCardFormGroup=this.checkoutFormGroup.get("creditCard");
    const currentYear:number=new Date().getFullYear();
    const selectedYear:number=Number(creditCardFormGroup.value.expirationYear);
    let startMonth:number;
    
    if(currentYear==selectedYear){
      startMonth=new Date().getMonth()+1;
    }else{
      startMonth=1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        //console.log("card months: "+JSON.stringify(data));
        this.creditCardMonths=data;
      }
    );
  }

  getStates(formGroupName:string){
    const formGroup=this.checkoutFormGroup.get(formGroupName);
    //console.log("formGroup.value: ",formGroup.value);
    const countryCode=formGroup.value.country.code;
    const countryName=formGroup.value.country.name;
    //console.log("contry code: "+countryCode+" name: "+countryName);
    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data=>{
        if(formGroupName ==="shippingAdress"){
          //console.log("shipping state: ",data);
          this.shippingAddressStates=data;
        }else{
          this.billingAddressStates=data;
        }
        formGroup.get("state").setValue(data[0]);
      }
    );
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity=totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );
  }

  setupStripePaymentForm(){
    var elements=this.stripe.elements();
    this.cardElement=elements.create("card",{hidePostalCode:true});
    this.cardElement.mount("#card-element");
    this.cardElement.on("change",(event:any)=>{
      this.displayError=document.getElementById("card-errors");
      if(event.complete){
        this.displayError.textContent="";
      }else if(event.error){
        this.displayError.textContent=event.error.message;
      }
    });
  }

}
