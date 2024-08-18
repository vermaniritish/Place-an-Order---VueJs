<template>
<div class="profile">
        <p><a href="https://shaguna.in"><img src="https://shaguna.in/wp-content/themes/saloon/assets/images/footlogo.png" alt="logo" title="logo" style="max-width: 144px;margin-bottom: 10px;"></a></p>
        <div class="profile-area">
            <h3 class="my-2">Welcome {{ profile && profile.first_name }}!</h3>
            <p class="text-muted my-2"><strong>Phone Number:</strong> +91-{{ profile && profile.phonenumber }}</p>
        </div>
        <div class="text-end btn-area">
            <button class="btn btn-primary" v-on:click="logout()">Logout</button>
        </div>
    </div>
</template>
<script>
    import config from '../../config';
    
    export default {
        name: 'Profile',
        props: {
            profile: Object,
        },
        components: {
        },
        data() {
            
        },
        methods: {
            logout() {
                localStorage.removeItem('auth');
                window.location.href = config.web_url;
            }
        },
        mounted() {
        },
    };
    </script>
        