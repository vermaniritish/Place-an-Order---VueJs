
<template>
    <div :class="`col-sm-12 product-block`">
        <div class="seller-area">
            <div class="product-image" v-if="product.image">
                <img :src="url(product.image)" />
                <div class="counter d-md-none d-flex">
                    <button>-</button>
                    <p>0</p>
                    <button>+</button>
                </div>
            </div>
            <div class="product-content">
                <div class="in-area">
                    <div class="left-area">
                        <span class="category">
                            Category
                        </span>
                        <h3>{{  product.title }}</h3>
                        <ul>
                            <li>
                                
                            <span v-if="product.sale_price > 0">{{ _money(product.sale_price) }} <del>{{ _money(product.price) }}</del></span>
                            <span v-else>{{ _money(product.price) }}</span>
                            </li>
                            <li v-if="((product.service_hours && product.service_hours > 0) || (product.service_minutes && product.service_minutes > 0))">
                                <i class="fal fa-clock"></i>
                                <p>
                                        {{ (product.service_hours && product.service_hours > 0 ? `${product.service_hours} hr ` : '') + (product.service_minutes && product.service_minutes > 0 ? `${product.service_minutes} mins ` : '') }}
                                </p>
                            </li>
                            <li v-if="product.brands && product.brands.length" v-for="b in product.brands">
                                <img :src="url(b.image)" :alt="b.title" />
                            </li>
                        </ul>
                    </div>
                    <div class="right-area">
                        <div class="counter d-md-flex d-none">
                            <button>-</button>
                            <p>0</p>
                            <button>+</button>
                        </div>
                    </div>
                </div>
                <div class="point-area" v-html="product.description">
                    
                </div>
            </div>
        </div>
        <div class="product-actions">
        </div>
    </div>
</template>

<script>
import config from '@/config';
export default {
  name: 'Product',
  props: {
    product: Object,
  },
  components: {
    
  },
  data() {
    return {
    };
  },
  methods: {
      init: async () => {
      }
  },
  mounted() {
    this.init();
  },
};
</script>