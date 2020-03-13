<template>
  <!-- Provides the application the proper gutter -->
  <v-container fluid :style="{padding: 0}">
    <v-row no-gutters>
      <v-col cols="6" class="pr-2">
        <v-toolbar dense>
          <v-select
            v-model="request.method"
            dense
            hide-details
            :menu-props="{ maxHeight: '400' }"
            :items="items"
            :style="{flex: '0 0 100px'}"
          ></v-select>
          <v-text-field
            v-model="request.url"
            dense
            hide-details
            single-line
            :style="{fontSize: '13px'}"
          ></v-text-field>

          <v-btn icon @click="doRequest">
            <v-icon>mdi-send</v-icon>
          </v-btn>

          <v-progress-linear :active="loading" :indeterminate="loading" absolute bottom></v-progress-linear>
        </v-toolbar>

        <v-container fluid>
          <v-row dense>
            <v-col :cols="12">
              <v-card>
                <v-tabs show-arrows class="pt-2 pl-2 pr-2">
                  <v-tab key="headers" class="px-2">Header</v-tab>
                  <v-tab key="body" class="px-2">Body</v-tab>

                  <v-tab-item key="headers">
                    <v-container>
                      <v-row v-for="(header, index) in request.headers" :key="index">
                        <v-col cols="12" md="6" class="py-0">
                          <v-combobox
                            :items="commonHeaders"
                            label="name"
                            hide-details
                            v-model="header.name"
                          ></v-combobox>
                        </v-col>
                        <v-col cols="12" md="6" class="py-0">
                          <v-text-field
                            label="value"
                            required
                            hide-details
                            v-model="header.value"
                            append-outer-icon="mdi-delete"
                            @click:append-outer="deleteHeader(index)"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <div class="text-center pt-4">
                        <v-btn small color="primary" @click="addHeader">Add Header</v-btn>
                      </div>
                    </v-container>
                  </v-tab-item>

                  <v-tab-item key="body">
                    <v-container>
                      <editor
                        v-model="request.body.value"
                        @init="editorInit"
                        lang="json"
                        :theme="$vuetify.theme.dark ? 'tomorrow_night_eighties': 'tomorrow'"
                        height="100"
                      />
                    </v-container>
                  </v-tab-item>
                </v-tabs>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="6">
        <v-toolbar dense>
          <v-chip
            class="ma-2"
            :color="request.response.status|httpStatusCodeToTheme"
            text-color="white"
            v-if="request.response && !loading"
          >
            <v-avatar left>
              <v-icon>mdi-checkbox-marked-circle</v-icon>
            </v-avatar>
            {{ request.response.status }} {{request.response.statusText}}
          </v-chip>
        </v-toolbar>
        <v-container fluid>
          <v-row dense>
            <v-col :cols="12">
              <v-card v-if="request.response">
                <v-tabs show-arrows class="pt-2 pl-2 pr-2">
                  <v-tab key="body" class="px-2">Body</v-tab>
                  <v-tab key="headers" class="px-2">Header</v-tab>
                  <v-tab-item key="body">
                    <v-col class="d-flex" cols="12" sm="6">
                      <v-select
                        v-model="request.response.extension"
                        :items="extensions"
                        outlined
                        dense
                      />
                    </v-col>

                    <v-container v-if="request.response">
                      <editor
                        :value="typeof request.response.data == 'string'? request.response.data :JSON.stringify(request.response.data, null, 2)"
                        @init="editorInit"
                        :lang="request.response.extension"
                        :theme="$vuetify.theme.dark ? 'tomorrow_night_eighties': 'tomorrow'"
                        height="500px"
                      />
                    </v-container>
                  </v-tab-item>
                  <v-tab-item key="headers">
                    <v-container>
                      <v-simple-table dense>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">Name</th>
                              <th class="text-left">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(value, name) in request.response.headers" :key="name">
                              <td>{{ name }}</td>
                              <td>{{ value }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-container>
                  </v-tab-item>
                </v-tabs>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { commonHeaders } from '@/utils/common'
const mime = require('mime')
export default {
  mounted () {
    this.request = this.$route.params.request
  },
  watch: {
    $route (to, from) {
      console.log(to)
      this.request = to.params.request
      console.log(to.params.requests)
    }
  },
  components: {
    editor: require('vue2-ace-editor')
  },
  methods: {
    editorInit: function () {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/html')
      require('brace/mode/json') // language
      require('brace/mode/less')
      require('brace/theme/tomorrow_night_eighties')
      require('brace/theme/tomorrow')
      require('brace/snippets/json') // snippet
    },
    addHeader () {
      this.request.headers.push({ name: '', value: '' })
    },
    deleteHeader (index) {
      this.request.headers.splice(index, 1)
    },
    doRequest () {
      this.$axios.defaults.headers.common = []
      let that = this
      this.loading = true
      var headers = this.request.headers.reduce(function (map, obj) {
        map[obj.name] = obj.value
        return map
      }, {})

      console.log(headers)

      this.$axios({
        method: this.request.method,
        url: this.request.url,
        headers: headers,
        data: this.request.body.value
      }).then(
        response => {
          that.loading = false
          that.$set(that.request, 'response', {
            data: response.data,
            extension: mime.getExtension(response.headers['content-type']),
            headers: response.headers,
            status: response.status,
            statusText: response.statusText
          })
        },
        err => {
          console.log(err)
          that.loading = false
          that.$set(that.request, 'response', {})
        }
      )
    }
  },
  filters: {
    httpStatusCodeToTheme (code) {
      if (code < 200) return 'info'
      if (code < 300) return 'success'
      if (code < 400) return 'warning'
      if (code < 600) return 'error'
      return 'info'
    }
  },
  data () {
    return {
      commonHeaders,
      loading: false,
      extension: 'text',
      extensions: ['json', 'html', 'xml', 'text'],
      items: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      request: {
        url: '',
        method: '',
        headers: [],
        body: { type: '', value: '' }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.v-tab {
  text-transform: none;
  font-size: 15px;
  min-width: 0;
  letter-spacing: 0;
}
</style>
