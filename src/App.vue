<template>
  <v-app id="inspire">
    <drawer></drawer>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer app>
      <v-spacer></v-spacer>
      <div>&copy; {{ new Date().getFullYear() }}</div>
    </v-footer>
  </v-app>
</template>

<script>
import Drawer from '@/components/Drawer'

export default {
  name: 'App',
  components: {
    Drawer
  },
  mounted () {
    // change system color
    // if (
    //   window.matchMedia('(prefers-color-scheme: light)').matches ||
    //   window.matchMedia('(prefers-color-scheme: no-preference)').matches
    // ) {
    //   this.$vuetify.theme.dark = false
    // } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //   this.$vuetify.theme.dark = true
    // }
  },
  methods: {
  },
  data () {
    return {
    }
  }
}
</script>
