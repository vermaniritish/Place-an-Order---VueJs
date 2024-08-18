
<template>
    <div :class="`col-sm-12 product-block` + (quantity > 0 ? ` active-cart ` : ``)  + (detailPage ? ` order-detail ` : ``) ">
        <div class="seller-area">
            <div class="product-image" v-if="!detailPage">
                <img :src="product.image && product.image.length > 0 ? url(product.image[0].original) : `https://placehold.co/110x85`" />
                <div class="counter d-md-none d-flex" v-if="quantity < 1" @click="increment">
                    <button>Add</button>
                </div>
                <div class="counter d-md-none d-flex" v-else>
                    <button  @click="decrement">-</button>
                    <button>{{ quantity > 0 ? quantity : '0' }}</button>
                    <button @click="increment">+</button>
                </div>
            </div>
            <div :class="`product-content ` + (detailPage ? `w100` : '')">
                <div class="in-area">
                    <div class="left-area">
                        <span class="category" v-if="!detailPage && product.tag && product.tag.length > 0" v-for="t in product.tag">
                            {{t}}
                        </span>
                        
                        <h5 v-if="detailPage">{{  product.title }}</h5>
                        <h3 v-else>{{  product.title }}</h3>
                        <ul>
                            <li v-if="!detailPage">
                                
                                <span v-if="product.sale_price > 0">{{ _money(product.price) }} <del>{{ _money(product.sale_price) }}</del></span>
                                <span v-else>{{ `₹` + (product.price) }}</span>
                            </li>
                            <li v-if="product.duration_of_service && product.duration_of_service != '00:00:00'">
                                <i class="fal fa-clock"></i>
                                    {{ _st(product.duration_of_service) }}
                            </li>
                            <li class="brand-image d-none d-md-inline-flex" v-if="!detailPage && product.brands && product.brands.length" v-for="b in product.brands">
                                <img :src="b.image ? url(b.image) : `https://placehold.co/70x18`" :alt="b.title" />
                            </li>
                        </ul>
                        <ul class="d-md-none mt-2" v-if="!detailPage">
                            <li class="brand-image" v-if="product.brands && product.brands.length" v-for="b in product.brands">
                                <img :src="b.image ? url(b.image) : `https://placehold.co/70x18`" :alt="b.title" />
                            </li>
                        </ul>
                    </div>
                    <div :class="`right-area ${detailPage ? 'py-3 text-end' : ''}`">
                        <span v-if="detailPage" class="money text-black text-18">{{ _money(product.price) }}</span>
                        <div class="counter d-md-flex d-none" v-if="!detailPage && quantity < 1" @click="increment">
                            <button>Add</button>
                        </div>
                        <div class="counter d-md-flex d-none" v-else-if="!detailPage">
                            <button  @click="decrement">-</button>
                            <button>{{ quantity > 0 ? quantity : '0' }}</button>
                            <button @click="increment">+</button>
                        </div>
                    </div>
                </div>
                <div class="point-area inner-block" v-html="product.description">
                    
                </div>
            </div>
            
        </div>
        <div class="point-area outter-block" v-html="product.description">
        </div>
        <div class="product-actions">
        </div>
    </div>
</template>

<script>
export default {
  name: 'Product',
  props: {
    product: Object,
    detailPage: Boolean,
    cartStrip: Function
  },
  components: {
    
  },
  data() {
    return {
        quantity: 0,  
    };
  },
  methods: {
      init() {
        let cart = localStorage.getItem('cart');
        cart = cart ? JSON.parse(cart) : {};
        if(this.product && cart && cart[`product_${this.product.id}`] ) {
            this.quantity = cart[`product_${this.product.id}`].quantity * 1;
        }
      },
      increment() {
        this.quantity = this.quantity + 1;
        this.saveInCart();
      },
      decrement() {
        this.quantity = (this.quantity - 1) < 1 ? 0 : this.quantity - 1;;
        this.saveInCart();
      },
      saveInCart() {
        let cart = localStorage.getItem('cart');
        cart = cart ? JSON.parse(cart) : {};
        if(this.quantity <= 0 && cart[`product_${this.product.id}`]) {
            delete cart[`product_${this.product.id}`];
        }
        else {
            cart[`product_${this.product.id}`] = {id: this.product.id, quantity: this.quantity};
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.cartStrip();
      }
  },
  mounted() {
    this.init();
  },
};
</script>