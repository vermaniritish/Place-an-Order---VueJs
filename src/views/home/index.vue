<template>
  <main>
    <div :class="`row categories-listing`">
      
      <template v-for="(c, i) in categories" :key="c.id">
        <div v-if="i < 1 && heading" v-html="heading" :class="`col-sm-12 category-heading fixed-header`"  :id="`sticky-header`">
        </div>
        <div :class="`col-sm-12 category-heading listing-heading`"  :id="`c${c.slug}`">
          <h2>{{ c.title }}</h2>
        </div>
        <template v-for="p in c.products" :key="`p${p.id}`">
          <Product 
            :product="p"
            :cartStrip="cartStrip"
          />
        </template>
      </template>
    </div>
    <div :class="`row cart-bottom-block`" v-if="quantity > 0">
        <div class="col-md-12">
          <p class="text-center" v-if="total < minOrder"><i class="far fa-exclamation-circle"></i> Shop for {{_money(minOrder - total)}} more to proceed.</p>
          <div class="row pink-area">
            <div class="col-sm-6 text-start">
              <p class="quantity">({{quantity}} items) <span>{{ _money(total) }}</span></p>
            </div>
            <div class="col-sm-6 text-end">
                <button class="btn cancel-modal" @click="cancel">Cancel</button>
                <button class="btn proceed-cart btn-primary" :disabled="total < minOrder" @click="proceed">Proceed</button>
            </div>
          </div>
        </div>
    </div>
    <LoginModal 
      v-if="auth"
      :show="auth"
      :hide="hideAuth"
      :user="authorizeUser"
    />
  </main>
</template>

<script>
import config from '../../config';
import Product from './Product.vue';
import LoginModal from '../auth/index.vue';

export default {
  name: 'Home',
  components: {
    Product,
    LoginModal
  },
  data() {
    return {
      auth: false,
      user: null,
      minOrder: config.minOrder,
      categories: [],
      total: 0,
      quantity: 0,
      heading: null,
      lastheading: null
    };
  },
  methods: {
    async init() {
        window.scrollTo(0, 0);
        let response = await fetch(config.api_url + '/categories');
        response = await response.json();
        if (response && response.data && response.data.length > 0) {
          this.categories = response.data;
          this.cartStrip();
          setTimeout(() => {
            this.scrollToView();
          }, 30)
        } else {
          console.log('Error: Could not fetch products.');
        }
    },
    cartStrip() {
      let cart = localStorage.getItem('cart');
      cart = cart ? JSON.parse(cart) : {};
      let total = 0;
      let quantity = 0;
      for(let c of this.categories)
      {
        for(let p of c.products)
        {
          if(cart && cart[`product_${p.id}`] && cart[`product_${p.id}`].quantity > 0)
          {
              quantity += (cart[`product_${p.id}`].quantity * 1);
              total += (cart[`product_${p.id}`].quantity * ( (p.sale_price*1) > 0  ? p.sale_price : p.price) );
          }
        }
      }
      this.total = total;
      this.quantity = quantity;
    },
    async proceed() {
      if(this.total < this.minOrder) return false;
      let user = localStorage.getItem('auth');
		  user = user ? JSON.parse(user) : null;
      let response = await fetch(config.api_url + '/auth/auth-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: user && user.token
        })
      });
      response = await response.json();
      if(response && response.status) {
        localStorage.setItem('auth', JSON.stringify(response.user));
        this.$router.push('/get-information');  
      }
      else {
        this.auth = true;
      }
    },
    cancel() {
      window.location.href = 'https://shaguna.in';
    },
    scrollToView() {
      let slug = this.$route.params.slug;
      if(slug)
      {
          const targetDiv = document.getElementById(`c${slug}`);
          if(targetDiv)
          targetDiv.scrollIntoView({
            behavior: 'instant', // You can use 'auto' or 'smooth' for smooth scrolling
            block: 'start',     // Align the top of the target element with the top of the scroll container
          });
      }
    },
    hideAuth() {
			document.body.style.overflow = 'auto';
			this.auth = false;
		},
		authorizeUser(user) {
      this.auth = false;
			this.user = user;
      this.$router.push('/get-information'); 
		},
  },
  mounted() {
    this.init();
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        let currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        let all = document.querySelectorAll('.listing-heading')
        for(let i in all)
        {
          if(i == 'entries') return false;
          let t = all[i].getBoundingClientRect();
          if (currentScrollTop < lastScrollTop)
          {
            this.heading = all[i].innerHTML;
            break;
          }
          else if(t.y < 10)
          {
            this.heading = all[i].innerHTML;
          }  
        }
        lastScrollTop = currentScrollTop;
    });
  },
};
</script>
