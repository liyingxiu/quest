import axios from 'axios'

// change valid status code. defalut is 200-300
axios.defaults.validateStatus = function (status) {
  return status >= 0
}

export default axios
