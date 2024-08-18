<template>
	<main>
	<template v-if="!orderPlaced">
		<div :class="`row categories-listing time-slot-page`">
			<div :class="`col-sm-12 category-heading`">
				<h2><i class="far fa-arrow-left" v-on:click="back()" style="margin-right: 15px"></i>My Cart ({{ quantity }})
				</h2>
			</div>
			<div :class="`col-sm-12`">
				<div class="row">
					<div class="col-lg-8 col-sm-12 cart-products">
						<template v-for="p in cart" :key="`p${p.id}`">
							<Product :product="p" :cartStrip="cartStrip" />
						</template>
					</div>
					<div class="col-lg-4 col-sm-12">
						<div class="billing-details">
							<div class="white-area">
								<div class="row address-info">
									<div class="col-sm-12">
										<div class="addressNtime">
											<p class="address"><i class="far fa-map-marker-alt mr-1"></i> {{ information &&
												information.address }}</p>
											<p class="address"><i class="far fa-clock"></i> <small>{{ information &&
											information.date }} | {{ information && information.time }}</small></p>
										</div>
										<div class="action">
											<button class="btn btn-sm btn-primary" v-on:click="change">Change</button>
										</div>
									</div>
								</div>
							</div>
							<div class="white-area coupon-info">
								<div class="row">
									<div class="col-sm-12">
										<span v-if="!coupon" v-on:click="couponModal = true"><i class="far fa-badge-percent text-pink"></i> Coupons & Discounts</span>
										<span v-else v-on:click="couponModal = true"><i class="far fa-badge-check text-success"></i> {{coupon.coupon_code}} <small class="text-muted">applied</small></span>
										<button class="btn btn-primary btn-sm" v-if="!coupon" v-on:click="couponModal = true">Offers <i class="far fa-chevron-right"></i></button>
										<button class="btn btn-sm text-danger p-0" v-else v-on:click="coupon = null"><i class="far fa-times"></i> Remove</button>
									</div>
								</div>
							</div>
							<div class="white-area bill-summary">
								<p>Bill Summary<br><small style="color: #808080">Your billing details are </small></p>
								<hr />
								<div class="table-responsive">
									<table>
										<tr>
											<td>Net Amount</td>
											<td class="text-end">{{ _money(total) }}</td>
										</tr>
										<tr v-if="coupon">
											<td>Discount {{ coupon.is_percentage ? ` (${(coupon.amount*1).toFixed(0)}%)` : `` }}</td>
											<td class="text-end text-danger">- {{ _money(getDiscountAmount()) }}</td>
										</tr>
										<tr>
											<td>Taxable Amount</td>
											<td class="text-end">{{ _money(getTaxAmount()) }}</td>
										</tr>
										<tr class="divider">
											<td colspan="2"> </td>
										</tr>
										<tr>
											<th>Grand Total</th>
											<th class="text-end">{{ _money(getGrandTotal()) }}</th>
										</tr>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div :class="`row cart-bottom-block`" v-if="quantity > 0">
			<div class="col-sm-12">
				<p class="text-center" v-if="total < minOrder"><i class="far fa-exclamation-circle"></i> Shop for {{_money(minOrder - total)}} more to proceed.</p>
				<div class="row pink-area">
					<div class="col-sm-6 text-start">
						<a href="https://shaguna.in" class="btn" >Cancel</a>
					</div>
					<div class="col-sm-6 text-end">
						<!-- <button class="btn cancel-modal">Cancel</button> -->
						<button 
							v-on:click="submit()" 
							class="btn proceed-cart btn-primary"
							:disabled="total < minOrder"
						><i class="fa fa-spin fa-spinner" v-if="saving"></i> Place Order </button>
						<!-- {{ getGrandTotal() > 0 ? _money(getGrandTotal()) : ''}} -->
					</div>
				</div>
			</div>
		</div>
		<LoginModal 
			v-if="auth"
			:show="auth"
			:hide="hideModal"
			:user="authorizeUser"
		/>
		<CouponModal 
			v-if="couponModal"
			:total="total"
			:coupon="coupon"
			:show="couponModal"
			:hide="hideModal"
			:apply="applyCoupon"
		/>
	</template>
	<template v-else>
		<div :class="`row categories-listing time-slot-page`">
			<div :class="`col-sm-12 category-heading`">
				<h2><i class="far fa-arrow-left" v-on:click="home()" style="margin-right: 15px"></i> Order #{{ orderPlaced }}</h2>
			</div>
			<div class="row">
				<div class="col-sm-12">
					<p class="text-success text-center" style="font-size: 100px;"><i class="far fa-check-circle"></i></p>
					<h3 class="text-center my-4">Order Id: #{{ orderPlaced }}</h3>
					<p class="text-center mb-1">We have recieved your order. Your order will be accepted and processed in some minutes.</p>
					<p class="text-center mb-1">For order realted queries, feel free to contact us at <a href="tel:+91-7087373582">+91 7087373582</a> </p>
					<p class="text-center mt-4"><a :href="`/o/` + orderPlaced" target="_blank" class="btn btn-primary" >Track Order</a></p>
				</div>
			</div>
		</div>
	</template>
</main>
</template>
  
<script>
import config from '../../config';
import Product from '../home/Product.vue';
import LoginModal from '../auth/index.vue';
import CouponModal from './CouponModal.vue';
import moment from 'moment';
var coords = null;
export default {
	name: 'Cart',
	components: {
		Product,
		LoginModal,
		CouponModal
	},
	data() {
		return {
			couponModal: false,
			coupon: null,
			minOrder: config.minOrder,
			auth: false,
			total: 0,
			quantity: 0,
			information: null,
			cart: [],
			rate: null,
			margin: null,
			igst: null,
			cgst: null,
			sgst: null,
			user: null,
			orderPlaced: null,
			duration: null,
			travelCharges: 0,
			saving: false
		};
	},
	methods: {
		async init() {
			window.scrollTo(0, 0);
			let cart = localStorage.getItem('cart');
			let response = await fetch(config.api_url + '/categories?city='+this.information.city+'&cart=' + cart );
			response = await response.json();
			if (response && response.data && response.data.length > 0) {
				this.categories = response.data;
				this.travelCharges = response.travelCharges * 1;
				this.igst = response.gst;
				this.cartStrip();
			} else {
				console.log('Error: Could not fetch products.');
			}
		},
		back() {
			document.body.style.overflow = 'auto';
			this.$router.back();
		},
		home() {
			window.location.href = 'https://shaguna.in'
		},
		hideModal() {
			document.body.style.overflow = 'auto';
			this.auth = false;
			this.couponModal = false;
		},
		authorizeUser(user) {
			this.user = user;
		},
		cartStrip() {
			let cart = localStorage.getItem('cart');
			cart = cart ? JSON.parse(cart) : {};
			let total = 0;
			let quantity = 0;
			let inCart = [];
			for (let c of this.categories) {
				for (let p of c.products) {
					if (cart && cart[`product_${p.id}`] && cart[`product_${p.id}`].quantity > 0) {
						inCart.push(p);
						quantity += (cart[`product_${p.id}`].quantity * 1);
						total += (cart[`product_${p.id}`].quantity * ((p.sale_price * 1) > 0 ? p.sale_price : p.price));
					}
				}
			}
			this.cart = inCart;
			this.total = total;
			this.quantity = quantity;
		},
		getGeoInformation() {
			// Check if the Geolocation API is supported by the browser
			if ("geolocation" in navigator) {
				// Get the current position
				navigator.geolocation.getCurrentPosition(
					(position) => {
						// Access the coordinates from the position object
						const latitude = position.coords.latitude;
						const longitude = position.coords.longitude;
						coords = { latitude, longitude };
					},
					(error) => {
						// Handle errors (e.g., user denied permission)
						console.error("Error getting location:", error.message);
					}
				);
			} else {
				// Geolocation is not supported
				console.error("Geolocation is not supported by your browser");
			}

			return null;
		},
		change() {
			this.$router.push('/get-information');
		},
		getTaxAmount() {
			let margin = 0;
			let totalServices = 0;
			let includeTravelCharges = false;
			let cart = localStorage.getItem('cart');
			cart = cart ? JSON.parse(cart) : {};
			if(this.categories && cart)
			{
				for (let c of this.categories) {
					for (let p of c.products) {
						if (cart && cart[`product_${p.id}`] && cart[`product_${p.id}`].quantity > 0) {
							margin += p.deduction * cart[`product_${p.id}`].quantity;
							totalServices += cart[`product_${p.id}`].quantity;
							includeTravelCharges = includeTravelCharges ? includeTravelCharges : (p.base_price ? true : false)
						}
					}
				}
			}
			margin = (( (margin - this.getDiscountAmount()) - (includeTravelCharges ? this.travelCharges : 0)) * this.igst)/100;
			
			return margin;
		},
		getGrandTotal() {
			let t = 0;
			t += (this.total);
			t -= this.getDiscountAmount()
			t += this.getTaxAmount();
			return Math.ceil(t);
		},
		getDiscountAmount() {
			if(this.coupon && this.coupon.is_percentage)
			{
				return (this.total * this.coupon.amount)/100;
			}
			else if(this.coupon && !this.coupon.is_percentage)
			{
				return this.total <= this.coupon.amount ? this.total : this.coupon.amount;
			}

			return 0;
		},
		applyCoupon(code) {
			this.couponModal = false;
			this.coupon = code;
		},
		async submit() {
			if(this.total < this.minOrder || this.saving) return false;
			if(this.user && this.user.token)
			{
				this.getGeoInformation();
				let cart = localStorage.getItem('cart');
				cart = cart ? JSON.parse(cart) : {};
				this.saving = true;
				let response = await fetch(config.api_url + '/orders/booking', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						token: this.user.token,
						name: this.information.name,
						address: this.information.address,
						city: this.information.city,
						cart: cart,
						date: this.information.date,
						time: this.information.time,
						coupon: this.coupon,
						lat: coords && coords.latitude ? coords.latitude : null,
						lng: coords && coords.longitude ? coords.longitude : null,
					}),
				});
				response = await response.json();
				
				if(response && response.status)
				{
					let information = localStorage.getItem('information');
					information = information ? JSON.parse(information) : null;
					delete information.date;
					delete information.time;
					delete information.lat;
					delete information.lng;
					localStorage.setItem('information', JSON.stringify(information));
					localStorage.removeItem('cart');
					this.orderPlaced = response.orderId;
					console.log(this.orderPlaced);
				}
				else if(response.clear)
				{
					localStorage.removeItem('cart');
					localStorage.removeItem('information');
				}
				else if(response.authRequired)
				{
					this.auth = true;
				}
				this.saving = false;
			}
			else
			{
				this.auth = true;
			}
		}
	},
	beforeRouteLeave (to, from , next) {
		document.body.style.overflow = 'auto';
		next();
	},
	mounted() {
		if(!localStorage.getItem('cart')) {
			this.home();
			return false;
		}
		this.getGeoInformation();
		let information = localStorage.getItem('information');
		this.information = information ? JSON.parse(information) : null;
		let user = localStorage.getItem('auth');
		this.user = user ? JSON.parse(user) : null;
		this.init();
	},
};
</script>
  