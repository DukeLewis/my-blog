<template>
  <div class="app-wrapper">
    <div class="main-container">
      <AppMain />
    </div>
  </div>
</template>

<script>
import AppMain from '@/layout/components/AppMain'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Layout',
  components: {
    AppMain
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  // todo
}
</style>
