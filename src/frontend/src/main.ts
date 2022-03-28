import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./css/tailwind.css";

const app = createApp(App);

app.directive("scroll-to", {
    mounted: (el: HTMLElement) => {
      el.scrollIntoView({ behavior: "smooth" });
    },
  });

app.use(router).mount("#app");
