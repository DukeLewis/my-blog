<template>
  <div style="height: 100%;justify-content: center" class="flex" v-loading="initDataLoading">
    <div class="bg-yellow-50 border border-solid" style="width: 70%">
      <div style="padding: 16px;justify-content: space-between" class="flex">
        <div class="flex" style="align-items: center">
          <span>Created At {{ blogData.createdTime }}</span>
        </div>
        <div>
          <el-button size="small" @click="$router.push({ name: 'BlogList' })">返回列表</el-button>
          <el-button :style="{ visibility: !edit ? 'visible' : 'hidden' }" size="small" @click="clickHandle">{{ buttonText }}</el-button>
        </div>
      </div>
      <div v-if="!edit" style="padding: 16px;">
        <div style="margin-bottom: 16px"><span style="font-size: 20px;font-weight: 600;">{{ blogData.title }}</span></div>
        <div style="margin-bottom: 16px"><span style="font-size:16px">{{ blogData.description }}</span></div>
        <MdPreview :content="blogData.content" class="text-left blog-content-preview"/>
      </div>
      <div v-else style="padding: 16px;">
        <el-input v-model="blogData.title" placeholder="请输入标题" style="margin-bottom: 16px"></el-input>
        <el-input v-model="blogData.description" placeholder="请输入描述" type="textarea" style="margin-bottom: 16px"></el-input>
        <MdEditor v-model="blogData.content" @saveContent="saveContent"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BlogApi } from '@/api/Blog'
import MdPreview from '@/components/preview/MdPreview'
import MdEditor from '@/components/editor/MdEditor'
export default {
  name: 'BlogDetail',
  components: {
    MdPreview,
    MdEditor
  },
  data () {
    return {
      blogData: {}, // 博客数据
      edit: false, // 是否是编辑状态
      initDataLoading: false // 初始化数据加载状态
    }
  },
  created () {
    this.initDataLoading = true
    if (this.$route.params.id && this.$route.params.id !== '') {
      this.$store.commit('SET_BLOG_ID', this.$route.params.id)
    }
    if (this.id && this.id !== '') {
      BlogApi.getBlogDetail({ id: this.id }).then(res => {
        this.blogData = res
        this.initDataLoading = false
      })
    } else {
      this.blogData = {
        title: '',
        description: '',
        content: '',
        createdTime: new Date().toLocaleString()
      }
      this.initDataLoading = false
    }
  },
  computed: {
    ...mapState({
      id: state => state.blog.id
    }),
    buttonText () {
      return this.edit ? '保存' : '编辑'
    }
  },
  methods: {
    clickHandle () {
      this.$prompt('请输入验证码', '验证身份后才编辑博客', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        BlogApi.validated({ password: value })
          .then((res) => {
            if (res.success === false) {
              this.$message.error('验证失败')
            } else {
              this.$message.success('验证成功')
              this.edit = true
            }
          })
      }).catch(() => {
      })
    },
    saveContent () {
      if (!this.id || this.id === '') {
        // 调用保存接口
        BlogApi.saveBlog(this.blogData)
          .then((res) => {
            this.$message.success('保存成功')
            this.$store.commit('SET_BLOG_ID', res.data)
            this.$router.push({ name: 'BlogDetail', params: { id: res.data } })
          })
        return
      } else {
        // 调用更新接口
        BlogApi.updateBlog(this.blogData)
          .catch((err) => {
            this.$message.error(err)
          })
      }
      this.edit = false
    }
  }
}
</script>

<style scoped>
/deep/ .blog-content-preview > .v-md-editor-preview > .github-markdown-body {
  padding: 0;
  font-size:18px;
}
</style>
