import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems:CartItem[]=[];
  totalPrice:Subject<number>=new BehaviorSubject<number>(0);
  totalQuantity:Subject<number>=new BehaviorSubject<number>(0);

  //storage:Storage=sessionStorage;
  storage:Storage=localStorage;


  constructor() {
    let data=JSON.parse(this.storage.getItem("cartItems"));
    if(data != null){
      this.cartItems=data;
      
      this.computeCartTotals();
    }

  }

  persistCartItems(){
    this.storage.setItem("cartItems",JSON.stringify(this.cartItems));
  }

  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;//zaten Var Sepette
    let existingCartItem: CartItem = undefined;//mevcut Sepet Öğesi
  
    if (this.cartItems.length > 0) {//ürün sepette var mı kontrole edelim
      existingCartItem=this.cartItems.find(tempCartItem => tempCartItem.id===theCartItem.id);
      alreadyExistsInCart=(existingCartItem !=undefined);
    }

    if(alreadyExistsInCart){//ürün sepette var ise
        existingCartItem.quantity++;
    }else{//yok ise
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }


  computeCartTotals() {
    let totalPriceValue:number=0;
    let totalQuantityValue:number=0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity*currentCartItem.unitPrice;
      totalQuantityValue +=currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);
    this.persistCartItems();
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    for(let tempCartItem of this.cartItems){
      const subTotalPrice=tempCartItem.quantity*tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity:${tempCartItem.quantity}, unitPrice:${tempCartItem.unitPrice}, subTotalPrice:${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity:${totalQuantityValue}`);
    console.log("-------------------------");
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    const itemIndex=this.cartItems.findIndex(
      tempCartItem => tempCartItem.id==theCartItem.id
    );

    console.log("index: ",itemIndex);

    if(itemIndex>-1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }
  
}
