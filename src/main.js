import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import config from './config'
const app = createApp(App)

app.use(router)

app.config.globalProperties._money = function(s) {
    return `₹` + (s && s > 0 ? (s*1).toFixed('2') : '' );
};
app.config.globalProperties.url = function(path) {
    return config.base_url + path;
}

app.config.globalProperties._st = function(time) {
    let t = time.split(':');
    return (( t[0] * 1) > 0 ? ( t[0] * 1) + ' hr ' : '') + (t[1] + ' mins');
}
  

app.mount('#app')
