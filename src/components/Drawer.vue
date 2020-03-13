<template>
  <v-navigation-drawer app permanent>
    <template v-slot:prepend>
      <v-list>
        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="title">Quest</v-list-item-title>
            <v-list-item-subtitle>Quest REST Client</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-icon>mdi-menu-down</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-text-field label="Filter" dense clearable></v-text-field>
    </template>
    <!-- <v-divider></v-divider> -->

    <v-list dense>
      <v-list-item-group>
        <v-list-item
          v-for="request in requests"
          :key="request.id"
          :to="{ name: 'main', params: { requestId: request.id, request,  requests }}"
          @click.right="show($event, request)"
          @dblclick="saveRequest(request)"
          class="px-2"
        >
          <v-list-item-content>
            <v-list-item-title>
              <span v-if="changedRequest.has(request.id)">●</span>
              {{ request.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-chip color="green" text-color="white" x-small>{{request.method}}</v-chip>
              {{ request.url }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action class="ma-0">
            <v-btn icon @click.stop="show($event, request.id)">
              <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
      <v-card>
        <v-list dense>
          <v-list-item @click="console.log('hi')">
            <v-list-item-icon>
              <v-icon>mdi-content-duplicate</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Duplicate</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-textbox</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Rename</v-list-item-title>
          </v-list-item>
          <v-list-item @click="deleteRequest">
            <v-list-item-icon>
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block color="success" @click="dialog = true">
          <v-icon dark>mdi-plus</v-icon>New
        </v-btn>
      </div>
    </template>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">New Request:</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Name*" required v-model="newRequestName"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
          <v-btn color="blue darken-1" text @click="createNewRequest()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
let _ = require('lodash')
export default {
  name: 'Drawer',
  mounted () {
    this.savedRequest = this.$db.read().get('requests').value()
    this.requests = this.$db.read().get('requests').value()
    // let request = this.requests[0]
    // this.$router.push({ name: 'main', params: { requestId: request.id, request, requests: this.requests } })
  },
  computed: {
    // 从上次读取开始发生了变化的request id
    changedRequest () {
      const set1 = new Set([])
      for (let index = 0; index < this.requests.length; index++) {
        const element = this.requests[index]
        const savedElement = this.savedRequest[index]
        var isEqual = _.isEqual(
          _.omit(element, ['response']),
          _.omit(savedElement, ['response'])
        )
        if (!isEqual) {
          set1.add(element.id)
        }
      }
      return set1
    }
  },
  data () {
    return {
      dialog: false,
      newRequestName: '',
      currentMenuRequest: {},
      requests: [],
      savedRequest: [],
      showMenu: false,
      x: 0,
      y: 0,
      right: null
    }
  },
  methods: {
    createNewRequest () {
      this.$db.read().get('requests').insert({ title: this.newRequestName, method: 'GET', headers: [{ 'name': 'User-Agent', 'value': 'Quest' }], body: { type: '', value: '' } }).write()
      this.newRequestName = ''
      this.requests = this.$db.read().get('requests').value()
      this.dialog = false
    },
    saveRequest (request) {
      console.log('save request: ', request)
      this.$db.get('requests').find({ id: request.id }).assign(request).write()
      this.savedRequest = this.$db.read().get('requests').value()
    },
    deleteRequest () {
      console.log('delete request: ' + this.currentMenuRequest)
      _.remove(this.requests, this.currentMenuRequest)
      this.$db.get('requests').remove({ id: this.currentMenuRequest.id }).write()
      this.savedRequest = this.$db.read().get('requests').value()
    },
    show (e, request) {
      e.preventDefault()
      this.currentMenuRequest = request
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    }
  }
}
</script>

<style>
</style>
