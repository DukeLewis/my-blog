import request from '@/utils/request'
import { url } from '@/api/url'

export const BlogApi = {
  listBlog (params) {
    return request({
      url: url.Blog.listBlog,
      method: 'get',
      params
    })
  },
  getBlogDetail (params) {
    return request({
      url: url.Blog.getBlogDetail,
      method: 'get',
      params
    })
  },
  updateBlog (params) {
    return request({
      url: url.Blog.updateBlog,
      method: 'post',
      data: params
    })
  },
  saveBlog (params) {
    return request({
      url: url.Blog.saveBlog,
      method: 'post',
      data: params
    })
  },
  validated (params) {
    return request({
      url: url.Blog.validated,
      method: 'post',
      data: params
    })
  }
}
