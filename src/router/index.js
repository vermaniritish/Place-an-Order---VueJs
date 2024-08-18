import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/index.vue';
import TimeSlot from '../views/timeSlot/index.vue';
import Cart from '../views/cart/index.vue';
import MyOrders from '../views/myOrders/index.vue';
import OrderDetail from '../views/myOrders/detail.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:slug',
      name: 'HomeCat',
      component: Home
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/get-information',
      name: 'TimeSlot',
      component: TimeSlot
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart
    },
    {
      path: '/my-orders',
      name: 'MyOrders',
      component: MyOrders
    },
    {
      path: '/o/:id',
      name: 'OrderDetail',
      component: OrderDetail
    }
  ]
})

export default router
