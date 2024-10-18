<template>
  <div>
    <VMdEditor v-model="markdownContent" @save="saveHandle"/>
  </div>
</template>

<script>
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import hljs from 'highlight.js'
import VMdEditor from '@kangc/v-md-editor'

VMdEditor.use(githubTheme, {
  Hljs: hljs
})
export default {
  name: 'MdEditor',
  components: {
    VMdEditor
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      markdownContent: this.value
    }
  },
  watch: {
    value (newValue) {
      this.markdownContent = newValue
    },
    markdownContent (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    saveHandle () {
      this.$emit('saveContent', this.markdownContent)
    }
  }
}
</script>

<style scoped>

</style>
