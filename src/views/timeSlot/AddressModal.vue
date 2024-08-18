<template>
    <div class="bottom-modal-wrap">
        <div class="bottom-modal">
            <button class="close" v-on:click="hide()"><i class="far fa-times"></i></button>
            <div class="close-area row">
                <div class="col-sm-12"></div>
            </div>
            <div class="row" v-if="create">
                <div class="col-sm-12 mb-3">
                    <h5>Add Address</h5>
                </div>
                <div class="col-sm-12">
                    <div class="form-group">
                        <input id="address-field" type="text" :class="`form-control${address != '' ? ' active' : ''}`" v-model="address" v-on:keyup="addressTyping" />
                        <label for="address-field">Address, Street & Area</label>
                    </div>
                    <div class="form-group">
                        <input type="text" :class="`form-control${pincode != '' ? ' active' : ''}`" v-model="pincode" v-on:keyup="handleErrors" />
                        <label>Pincode</label>
                    </div>
                    <div class="form-group">
                        <span v-for="t in cities" :class="`badge badge-primary` + (city == t ? ' active' : '')" v-on:click="selectCity(t)">{{ t }}</span>
                    </div>
                </div>
                <div class="col-sm-12 mt-1">
                    <p class="text-danger text-center" v-if="error">{{ error }}</p>
                    <!-- <button class="btn btn-primary mb-2 bg-white" v-on:click="getGeoInformation"><i class="far fa-location-arrow"></i> Detect current location</button> -->
                    <button class="btn btn-primary" v-on:click="submit"> <i class="fa fa-spin fa-spinner" v-if="submitting"></i> Proceed</button>
                </div>
            </div>
            <div class="row" v-else>
                <div class="col-sm-12 mb-3">
                    <h5>Select Address</h5>
                </div>
                <div class="col-sm-12">
                    <div class="scrollable">
                        <div :class="`address-block `+(addressId && addressId == a.id ? `active` : ``)" v-for="a in addresses">
                            <div class="input" v-on:click="changeAddress(a)">
                                <i class="fas fa-dot-circle active" v-if="addressId && addressId == a.id"></i>
                                <i class="fal fa-dot-circle" v-else></i>
                            </div>
                            <div class="icon" v-on:click="changeAddress(a)"><i class="far fa-home"></i></div>
                            <div class="text" v-on:click="changeAddress(a)"><p><strong>{{ a.address }} {{ a.pincode }}</strong><br /> <span>{{ a.
                            city }}{{ a.city && a.pincode ? ', '+a.pincode : a.pincode }}</span></p></div>
                            <div class="menu"><button class="btn btn-sm" v-on:click="deleteAddress(a.id)"><i class="fa fa-spin fa-spinner" v-if="submitting && submitting == a.id"></i> <i v-else class="far fa-trash-alt"></i></button></div>
                        </div>
                    </div>
                    <button class="btn btn-primary" v-on:click="create = 1"> <i class="fa fa-plus"></i> Add new address</button>
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
		user: Function,
        setAddress: Function,
        addressId: String
	},
	components: {
	},
	data() {
		return {
            addresses: [],
            create: 0,
            error: ``,
            submitting: false,
            cities:``,
			address: ``,
            pincode: ``,
            city: ``,
		};
	},
	methods: {
        async init() {
            let response = await fetch(config.api_url + '/addresses?token=' + (this.user && this.user.token));
            response = await response.json();
            if(response && response.status)
            {
                if(response.addresses && response.addresses.length > 0) {
                    this.addresses = response.addresses;
                    this.create = 0;
                }
                else {
                    this.create = 1;
                }
                this.cities = response.cities;
            }
            else if(response && response.authRequired) {
                this.$router.back();
            }
        },
        async changeAddress(address) {

            this.setAddress(address);
        },
        async deleteAddress(id) {
            if(this.submitting) return false;
            this.submitting = id;
            let response = await fetch(config.api_url + '/addresses/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    token: this.user && this.user.token
                })
            });
            response = await response.json();
            this.submitting = false;
            if(response && response.status)
            {
                this.init();
            }
        },
        handleErrors() {
            if(!this.address.trim()) this.error = "Please enter your address to proceed.";
            else if(this.pincode.trim() && (!(this.pincode*1) || (this.pincode*1) < 1)) this.error = "Please enter a valid pincode.";
            else if(!this.city.trim()) this.error = "Please select your city.";
            else
                this.error = null;
            return this.error;
        },
		async submit() {
            this.getGeoInformation();9
            if(!this.handleErrors())
            {
                if(this.submitting) return false;
                this.submitting = true;
                let response = await fetch(config.api_url + '/addresses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address: this.address,
                        pincode: this.pincode,
                        city: this.city,
                        latitude: coords && coords.latitude ? coords.latitude : null,
                        longitude: coords && coords.longitude ? coords.longitude : null,
                        token: this.user && this.user.token
                    })
                });
                response = await response.json();
                this.submitting = false;
                if(response && response.status)
                {
                    this.changeAddress(response.address);
                }
                else if(response && response.authRequired) {
                    this.$router.back();
                }
                else if(response && response.message) {
                    this.error = response.message;
                }
            }
		},
        getGeoInformation() {
			// Check if the Geolocation API is supported by the browser
			if ("geolocation" in navigator) {
				// Get the current position
				let l = navigator.geolocation.getCurrentPosition(
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
        addressTyping() {
            let c = this.cities.filter((i) => {
                return this.address && this.address.toLowerCase().indexOf(i.toLowerCase()) > -1;
            });

            if(c && c.length > 0) {
                this.city = c[0];
            }
            this.handleErrors();
        },
        selectCity(c) {
            this.city = c;
            this.handleErrors();
        }
	},
	mounted() {
        this.init()
	},
};
</script>
  