<template>
	<main>
		<div :class="`row categories-listing`" v-if="user">
            
			<div :class="`col-sm-12 category-heading`">
                <Profile
                    :profile="profile"
                />
                
				<h2 class="mt-3"><i class="far fa-arrow-left" v-on:click="back()" style="margin-right: 5px"></i> My Orders</h2>
			</div>
			<div class="">
                <div v-if="order && order.status && staticData && staticData.status && staticData.status[order.status]" class="alert py-2" :style="`${staticData.status[order.status].styles}`">{{ staticData.status[order.status].message }}</div>
                <div :class="`col-sm-12 product-block order-block`" v-if="order">
                    <div class="seller-area"  v-on:click="gotToDetail(order.id)">
                        <div class="product-content">
                            <div class="in-area">
                                <div class="left-area">
                                    <span class="category bg-gray">
                                        {{order.service_count}} Services
                                    </span>
                                    <small class="float-end"><i class="far fa-calendar text-pink mr-2"></i> {{  moment(order.created).format('DD MM, YYYY') + ' ' + moment(order.created).format('LT') }}</small>
                                    <div class="row">
                                        <div class="col-sm-8">
                                            <h4>Order: #{{order.id}}</h4>
                                            <p class="booking-time mt-0 text-16"><label class="text-muted">Booking Time:</label> <br /> <i class="far fa-calendar"></i> {{ moment(order.booking_date).format('DD MMM, YYYY') }}  &nbsp; &nbsp;<i class="far fa-clock"></i>{{ moment(order.booking_time, 'HH:mm').format('LT') }}</p>
                                            <p class="address  text-16"><i class="far fa-map-marker-alt"></i> {{ order.address }}</p>
                                        </div>
                                        <div class="col-sm-4">
                                            <p class="text-end price-field"><span class="money">{{ _money(order.total_amount) }}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
				</div>
                <h5 class="mb-3">Services are included in this order.</h5>
                <template v-for="p in order.products" :key="`p${p.id}`" v-if="order && order.products">
                    <Product :product="p" :detailPage="true" />
                </template>
                <div class="billing-details bg-white" v-if="order">
                    <div class="white-area bill-summary">
                        <p>Bill Summary<br><small style="color: #808080">Your billing details are </small></p>
                        <hr />
                        <div class="table-responsive">
                            <table>
                                <tr>
                                    <td>Net Amount</td>
                                    <td class="text-end">{{ _money(order.subtotal) }}</td>
                                </tr>
                                <tr v-if="order.discount > 0">
                                    <td>Discount</td>
                                    <td class="text-end text-danger">-{{ _money(order.discount) }}</td>
                                </tr>
                                <tr v-if="order.cgst !== null && order.sgst !== null">
                                    <td>CGST ({{order.cgst}}%)</td>
                                    <td class="text-end">{{ _money(order.cgst_tax) }}</td>
                                </tr>
                                <tr v-if="order.cgst !== null && order.sgst !== null">
                                    <td>SGST ({{order.sgst}}%)</td>
                                    <td class="text-end">{{ _money(order.sgst_tax) }}</td>
                                </tr>
                                <tr v-else="order.igst !== null">
                                    <td>IGST ({{order.igst}}%)</td>
                                    <td class="text-end">{{ _money(order.igst_tax) }}</td>
                                </tr>
                                <tr class="divider">
                                    <td colspan="2"> </td>
                                </tr>
                                <tr>
                                    <th>Grand Total</th>
                                    <th class="text-end money text-16">{{ _money(order.total_amount) }}</th>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <p v-if="order && order.status == 'pending'"><a href="javascript:;" class="text-danger" v-on:click="cancelOrder">Cancel Order</a></p>
                        <p v-else-if="order && order.status == 'completed'"><a :href="invoiceLink()" target="_blank" class="btn btn-primary"><i class="far fa-download"></i> Download Invoice</a></p>
                    </div>
                </div>
			</div>
		</div>
        <p v-if="!user" class="text-center"><img src="https://app.shaguna.in/assets/img/banner.png" style="max-width: 90%; max-height: 500px;" /></p>
		<LoginModal 
			v-if="auth"
            :nocross="true"
			:show="auth"
			:hide="hideAuth"
			:user="authorizeUser"
		/>
</main>
</template>
  
<script>
import moment from 'moment';
import config from '../../config';
import Product from '../home/Product.vue';
import LoginModal from '../auth/index.vue';
import Profile from '../profile/index.vue';
var coords = null;
export default {
	name: 'MyOrders',
	components: {
		Product,
		LoginModal,
        Profile
	},
	data() {
		return {
            moment:moment,
			minOrder: config.minOrder,
			auth: false,
			user: null,
            order: null,
            encId: null,
            profile: null,
            staticData : null,
		};
	},
	methods: {
		async init() {
			window.scrollTo(0, 0);
            
            if(this.user && this.user.token)
            {
                let response = await fetch(config.api_url + '/user/'+this.user.token+'/order/'+this.$route.params.id);
                response = await response.json();
                if(response && response.status && response.data)
                {
                    this.order = response.data;
                    this.staticData = response.static;
                    this.profile = response.user;
                    this.encId = response.encId;
                }
                else if(response.authRequired)
                {
                    this.auth = true;
                }
                else {
                    this.$router.push('/my-orders');
                }
            }
            else
            {
                localStorage.removeItem('auth');
                this.user = null;
                this.auth = true;
            }
		},
		back() {
            this.$router.push('/my-orders');
		},
		hideAuth() {
			document.body.style.overflow = 'auto';
			this.auth = false;
		},
		authorizeUser(user) {
			this.user = user;
            this.init();
		},
        async cancelOrder() {
            if(confirm('Are you sire to cancel this order?'))
            {
                let response = await fetch(config.api_url + '/orders/'+this.user.token+'/cancel-booking', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
                        id: this.order.id
                    })
                });
				response = await response.json();
                if(response && response.status) {
                    window.scrollTo(0, 0);
                    if(response.order)
                    this.order = response.order;
                }
            }
        },
        invoiceLink() {
            return config.base_url + `/invoice/${this.encId}/pdf`;
        }
	},
	beforeRouteLeave (to, from , next) {
		document.body.style.overflow = 'auto';
		next();
	},
	mounted() {
		let user = localStorage.getItem('auth');
		this.user = user ? JSON.parse(user) : null;
		this.init();
	},
};
</script>
  