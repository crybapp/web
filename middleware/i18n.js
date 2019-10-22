import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

export default ({ app }) => {
  app.i18n = new VueI18n({
    locale: "en_US",

    fallbackLocale: "en_US",
    messages: {
      en_US: require("~/lang/en_US.json")
    }
  });
};