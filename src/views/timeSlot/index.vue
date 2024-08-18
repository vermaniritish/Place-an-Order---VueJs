<template>
	<main>
		<div :class="`row categories-listing time-slot-page`">
			<div :class="`col-sm-12 category-heading`">
				<h2><i class="far fa-arrow-left" v-on:click="back()" style="margin-right: 15px"></i>Address & Time Slot.</h2>
			</div>
			<div class="col-sm-12 product-block">
				<p class="mb-2" v-if="!user || !user.name"><i class="far fa-exclamation-circle"></i> Enter your information to complete the order.</p>
				<div class="form-group" v-if="!user || !user.name">
					<input type="text" :class="`form-control${name != '' ? ' active' : ''}`" v-model="name" />
					<label>Your Name</label>
				</div>
				<div class="form-group mt-1 mb-3 px-1" v-else>
					<h3>Welcome {{ user && user.name }}!</h3>
				</div>
				<p class="mb-2" v-if="user && user.name"><i class="far fa-exclamation-circle"></i> Enter your address to complete the order.</p>
				<div class="form-group location-group">
					<input id="address-field-i" type="text" :class="`form-control${address != '' ? ' active' : ''}`" :value="address" :disabled="addressModal" v-on:focus="addressModal = true" />
					<label for="address-field-i">Address, City & Pincode</label>
					<i class="far fa-map-marker-alt" v-on:click="getGeoInformation"></i>
				</div>
				<div class="slots container">
					<div class="row">
						<div class="col-sm-12 heading">
							<div class="clock">
								<i class="far fa-clock"></i>
							</div>
							<div class="text">
								<h4>Slots</h4>
								<p>When should the professional arrive?</p>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-4 date-time-block">
							<p>Select Date</p>
							<a href="javascript:;" :class="`date` + (d.date == activeDate ? ' active' : '')" v-for="d in slots" v-on:click="loadTimeSlots(d)">
								<div class="day">{{ d.day }}</div>
								<div class="val">{{ d.d }}</div>
							</a>
						</div>
						<div class="col-sm-1">&nbsp;</div>
						<div class="col-sm-7 date-time-block">
							<p>Select Time</p>
							<button v-if="times && times.length > 0" :class="`btn btn-time${activeTime == t ? ' active' : ''}`" v-for="t in times" v-on:click="activeTime = t">{{t}}</button>
							<div class="text-center mt-4" v-else>
								<p class="text-danger text-center">There are no booking open for this day. Please select another date for slots.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div :class="`row cart-bottom-block`" v-if="quantity > 0">
        <div class="col-md-12">
			<p class="error text-danger mt-2 text-center" v-if="error"><small>{{ error }}</small></p>
          <div class="row pink-area">
            <div class="col-sm-6 text-start">
              <p class="quantity">({{quantity}} items) <span>{{ _money(total) }}</span></p>
            </div>
            <div class="col-sm-6 text-end">
                <a href="https://shaguna.in" class="btn cancel-modal" >Cancel</a>
                <button class="btn proceed-cart btn-primary" @click="proceed">Proceed</button>
            </div>
          </div>
        </div>
    </div>
	<AddressModal 
		v-if="addressModal"
		:show="addressModal"
		:hide="hideAddressModal"
		:user="user"
		:setAddress="setAddress"
		:addressId="addressId"
	/>
	</main>
</template>
  
<script>
import config from '../../config';
import AddressModal from './AddressModal.vue';
export default {
	name: 'TimeSlot',
	components: {
		AddressModal
	},
	data() {
		return {
			addressModal: false,
			addressId: null,
			city: null,
			user: null,
			error: ``,
			name: ``,
			address: ``,
			total: 0,
			quantity: 0,
			slots: [],
			times: [],
			activeDate: null,
			activeTime: null,
			lat: ``,
			lng: ``
		}
	},
	methods: {
		async init() {
			let response = await fetch(config.api_url + '/categories');
			response = await response.json();
			if (response && response.data && response.data.length > 0) {
				this.categories = response.data;
				this.cartStrip();
			} else {
				console.log('Error: Could not fetch products.');
			}
		},
		cancel() {
			window.location.href = 'https://shaguna.in';
		},
		back() {
			this.$router.back();
		},
		authorizeUser() {
			let user = localStorage.getItem('auth');
			this.user = user ? JSON.parse(user) : null;
			this.name = this.user && this.user.name;
		},
		hideAddressModal() {
			this.addressModal = false;
		},
		setAddress(address) {
			this.addressId = address && address.id ? address.id : null;
			this.city = address && address.city ? address.city : null;
			this.address = address.address + ', ' + address.city + (address.pincode ? ' ' + address.pincode : '' );
			this.lat = address.latitude;
			this.lng = address.longitude;
			this.addressModal = false;
		},
		async getSlots() {
			let response = await fetch(config.api_url + '/slots');
			response = await response.json();
			if (response && response.dates) {
				this.slots = response.dates;
				if(response.dates && response.dates.length > 0) {
					if(this.activeDate) {
						let exist = response.dates.filter((item) => {
							return item.date == this.activeDate;
						});
						if(exist && exist.length > 0)
						{
							let activeTime = this.activeTime;
							this.loadTimeSlots(exist[0]);
							this.activeTime = activeTime;
						}
						else
						{
							this.loadTimeSlots(response.dates[0])
							this.activeDate = response.dates[0].date;	
						}
					}
					else
					{
						this.loadTimeSlots(response.dates[0])
						this.activeDate = response.dates[0].date;
					}
				}
			} else {
				console.log('Error: Could not fetch products.');
			}
		},
		cartStrip() {
			let cart = localStorage.getItem('cart');
			cart = cart ? JSON.parse(cart) : {};
			let total = 0;
			let quantity = 0;
			for (let c of this.categories) {
				for (let p of c.products) {
					if (cart && cart[`product_${p.id}`] && cart[`product_${p.id}`].quantity > 0) {
						quantity += (cart[`product_${p.id}`].quantity * 1);
						total += (cart[`product_${p.id}`].quantity * ((p.sale_price * 1) > 0 ? p.sale_price : p.price));
					}
				}
			}
			this.total = total;
			this.quantity = quantity;
		},
		loadTimeSlots(d) {
			this.activeDate = d.date;
			let time = d.time;
			let times = [];
			for (let t of time) {
				if (!d.disabled.includes(t)) {
					times.push(t);
				}
			}
			this.times = times;
			this.activeTime = null;
		},
		proceed() {
			if(!this.name || !this.address) {
				this.error = "Please enter you name and address information."
			}
			else if(!this.activeDate || !this.activeTime) {
				this.error = "Please select your prefer date and time."
			}
			else {
				this.error = null;
				localStorage.setItem('information', JSON.stringify({
					name: this.name,
					addressId: this.addressId,
					city: this.city,
					address: this.address,
					lat: this.lat,
					lng: this.lng,
					date: this.activeDate,
					time: this.activeTime
				}));
				this.$router.push('/cart');
			}
		}
	},
	mounted() {
		let information = localStorage.getItem('information');
		information = information ? JSON.parse(information) : null;
		this.activeDate = information && information.date ? information.date : ``;
		this.activeTime = information && information.time ? information.time : ``;
		this.addressId = information && information.addressId && information.city ? information.addressId : null;
		this.address = information && information.address && information.city ? information.address : null;
		this.city = information && information.city ? information.city : null;
		window.scrollTo(0, 0);
		this.authorizeUser();
		this.init();
		this.getSlots();
	},
};
</script>
  