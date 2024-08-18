<template>
    <div class="bottom-modal-wrap">
        <div class="bottom-modal">
            <button class="close" v-on:click="hide()"><i class="far fa-times"></i></button>
            <div class="close-area row">
                <div class="col-sm-12"></div>
            </div>
            <div class="row">
                <div class="col-sm-12 mb-3">
                    <h5>Coupons & Offers</h5>
                </div>
                <div class="col-sm-12">
                    <div class="scrollable">
                        <div class="coupon-flat" v-for="c in list">
                            <div class="details">
                                <h6>{{ c.coupon_code }}</h6>
                                <p><small>{{ c.description }}</small></p>
                            </div>
                            <div>
                                <button class="btn btn-primary btn-sm" v-if="coupon && coupon == c.coupon_code"><i class="far fa-check"></i> Applied</button>
                                <button class="btn btn-primary btn-sm" :disabled="c.min_amount > 0 && total < c.min_amount" v-else v-on:click="apply(c)">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import config from '../../config';
var coords = null;
export default {
	name: 'AddressModal',
	props: {
    	show: Boolean,
		hide: Function,
		apply: Function,
        coupon: String,
        total:  String
	},
	components: {
	},
	data() {
		return {
            list: []
		};
	},
	methods: {
        async init() {
            let response = await fetch(config.api_url + '/coupons');
            response = await response.json();
            if(response && response.data && response.data.data && response.data.data.length > 0)
            {
                this.list = response.data.data;
            }
        }
	},
	mounted() {
        this.init()
	},
};
</script>
  