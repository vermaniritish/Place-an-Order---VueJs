<template>
	<main :class="!user ? `pt-0` : ``">
		<div :class="`row categories-listing`" v-if="user">
            
			<div :class="`col-sm-12 category-heading`">
                <Profile
                    :profile="profile"
                />
				<h2 class="mt-3"><i class="far fa-arrow-left" v-on:click="back()" style="margin-right: 5px"></i> My Orders</h2>
			</div>
            
			<div class="">
                <div :class="`col-sm-12 product-block order-block`" v-if="orders && orders.length > 0" v-for="item in orders">
                    <div class="seller-area"  v-on:click="gotToDetail(item.id)">
                        <div class="product-content">
                            <div class="in-area">
                                <div class="left-area">
                                    <span class="category bg-gray">
                                        {{item.service_count}} Services
                                    </span>
                                    <small class="float-end"><i class="far fa-calendar text-pink mr-2"></i> {{  moment(item.created).format('DD MM, YYYY') + ' ' + moment(item.created).format('LT') }}</small>
                                    <div class="row">
                                        <div class="col-sm-8">
                                            <h4>Order: #{{item.id}}</h4>
                                            <span v-if="staticData && staticData.status && staticData.status[item.status]" class="badge" :style="`${staticData.status[item.status].styles}`">{{ staticData.status[item.status].label }}</span>
                                            <p class="booking-time"><label class="text-muted">Booking Time:</label> <br /> <i class="far fa-calendar"></i> {{ moment(item.booking_date).format('DD MMM, YYYY') }}  &nbsp; &nbsp;<i class="far fa-clock"></i>{{ moment(item.booking_time, 'HH:mm').format('LT') }}</p>
                                            <p class="address"><i class="far fa-map-marker-alt"></i> {{ item.address }}</p>
                                        </div>
                                        <div class="col-sm-4">
                                            <p class="text-end price-field"><span class="money">{{ _money(item.total_amount) }}</span></p>
                                            <p class="text-end"><button v-on:click="gotToDetail(item.id)" class="btn btn-sm btn-primary">View Details</button></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
				</div>
                <div v-else>
                    <div class="row">
                        <div class="col-sm-12">
                            <p class="text-warning text-center" style="font-size: 100px;"><i class="far fa-exclamation-square"></i></p>
                            <h4 class="text-center mb-1 mt-2">There are no orders availble.</h4>
                            <p class="text-center mb-1">Explore our services and Book skilled professionals for personalized luxury.</p>
                            <p class="text-center mt-4"><a href="javascript:;" class="btn btn-primary" v-on:click="home()" >Book Now</a></p>
                        </div>
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
            orders: [],
            profile: null,
            staticData : null
		};
	},
	methods: {
		async init() {
			window.scrollTo(0, 0);
            if(this.user && this.user.token)
            {
                let response = await fetch(config.api_url + '/user/'+this.user.token+'/orders');
                response = await response.json();
                if(response && response.status)
                {
                    this.orders = response.data;
                    this.staticData = response.static;
                    this.profile = response.user;
                }
                else if(response.authRequired)
                {
                    localStorage.removeItem('auth');
                    this.user = null;
                    this.auth = true;
                }
            }
            else
            {
                this.auth = true;
            }
		},
		back() {
			document.body.style.overflow = 'auto';
			window.location.href = config.web_url;
		},
        home() {
			this.$router.push('/');
		},
		hideAuth() {
			document.body.style.overflow = 'auto';
			this.auth = false;
		},
		authorizeUser(user) {
			this.user = user;
            this.init();
		},
        gotToDetail(id) {
            this.$router.push('/o/' + id);
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
  