<template>
  <div>
    <VMdPreview :text="content"/>
  </div>
</template>

<script>
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import hljs from 'highlight.js'

VMdPreview.use(githubTheme, {
  Hljs: hljs
})
export default {
  name: 'MdPreview',
  components: {
    VMdPreview
  },
  props: {
    content: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>

</style>
