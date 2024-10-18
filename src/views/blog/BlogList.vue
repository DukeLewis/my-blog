<template>
  <div class="flex" style="justify-content: center" v-loading="initDataLoading">
    <div class="flex" style="flex-direction: column;width: 70%">
      <div>
        <el-button size="small" class="bg-sky-100" @click="addNewBlog">添加博客</el-button>
      </div>
      <div v-for="(blog, index) in blogList" :key="index" @click="clickHandle(blog.id)">
        <el-card shadow="hover" class="blog-card mt-2.5 h-36 flex bg-slate-50">
          <div style="flex-grow: 2;" class="font-size-20-weight-600">{{ blog.title }}</div>
          <div style="flex-grow: 7;">{{ blog.description }}</div>
          <div style="flex-grow: 1;justify-content: flex-end" class="font-size-14px flex">
            <div>Created At {{ blog.createdTime }}</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { BlogApi } from '@/api/Blog'
export default {
  name: 'BlogList',
  data () {
    return {
      blogList: [], // 博客列表
      initDataLoading: false // 初始化数据加载状态
    }
  },
  created () {
    this.initDataLoading = true
    if (!this.blogList || this.blogList.length === 0) {
      BlogApi.listBlog().then(res => {
        this.blogList = res.blogList
        this.initDataLoading = false
      })
    }
  },
  methods: {
    clickHandle (blogId) {
      this.$router.push({
        name: 'BlogDetail',
        params: {
          id: blogId
        }
      })
    },
    addNewBlog () {
      // this.blogList.push({
      //   id: null,
      //   title: '',
      //   description: '',
      //   content: ''
      // })
      this.$prompt('请输入验证码', '验证身份后才可创建新博客', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        BlogApi.validated({ password: value })
          .then((res) => {
            if (res.success === false) {
              this.$message.error('验证失败')
            } else {
              this.$message.success('验证成功')
              this.$store.commit('SET_BLOG_ID', null)
              this.$router.push({
                name: 'BlogEdit'
              })
            }
          })
      }).catch(() => {
      })
    }
  }
}
</script>

<style scoped>
/deep/ .blog-card > .el-card__body {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.font-size-20-weight-600 {
  font-size: 20px;
  font-weight: 600;
}
.font-size-14px {
  font-size: 14px;
}
</style>
