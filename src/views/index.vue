<template>
  <div class="measure" :class="{ 'active-border': measurePopoverVisible }" @click="showDropdown">
    <div class="h-full flex-align-center" :class="{ 'lg-scrollbar': !haveStandardsViewHeight }">
      <div class="h-full">
        <el-popover
          placement="left-start"
          trigger="click"
          :disabled="disabled"
          :append-to-body="haveStandardsViewHeight"
          class="h-full measures-tree-popover"
          popper-class="cg-measures-tree-dropdown"
          :visible-arrow="false"
          v-model="measurePopoverVisible">
          <!-- 搜索测评点 -->
          <el-input
            class="b-a"
            maxlength=100
            :placeholder="$t('loc.curriculumUnitSearchMeasure')"
            prefix-icon="el-icon-search"
            v-model="searchMeasureStr">
          </el-input>

          <!-- 测评点列表 -->
          <!-- 树形结构 -->
          <div class="measures-tree-container lg-scrollbar-show add-margin-t-16">
            <el-tree
              :data="allMeasures"
              show-checkbox
              :default-expand-all="false"
              node-key="id"
              :props="defaultProps"
              :empty-text="measuresDataLoading ? ' ' : 'No data'"
              :render-content="renderMeasuresContent"
              @check="selectMeasureHandle"
              :filter-node-method="filterNode"
              ref="measuresDataTree">
            </el-tree>
          </div>
          <!-- 确认按钮 -->
          <div style="text-align: right;" class="lg-margin-top-8">
            <el-button type="primary" size="small" @click="measurePopoverVisible = false">{{ $t('loc.curriculumUnitSave') }}</el-button>
          </div>

          <div slot="reference" v-show="showEditView "
               class="h-full"
               :class="{ 'row-border': showEditView }">
            <!-- 触发弹出框的元素 -->
            <!-- 测评点内容 -->
            <div :class="{ 'lg-scrollbar': haveStandardsViewHeight }" :style="standardsViewHeight">
              <div v-show="(!this.selectedMeasures || this.selectedMeasures.length === 0)"
                   class="lg-color-text-placeholder focus-color"
                   :class="{'measures-font': !measurePopoverVisible, 'measures-font-focus': measurePopoverVisible}">
                {{ $t('loc.curriculumUnitSelectMeasure') }}
              </div>
              <span v-for="(measure, index) in selectedMeasures" :key="index">
                  <el-tag type="info" size="small" class="m-r-xs pos-rlt m-b-xs" disable-transitions>
                      <span style="color: #676879">
                        {{ measure.abbreviation }}
                      </span>
                      <i v-if="!disabled" @click.stop="removeSelectedItem(measure)" class="flag el-icon-close red lg-pointer"></i>
                  </el-tag>
                </span>
            </div>
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MeasureRow',
  props: {
    // 框架下所有测评点数据
    domains: {
      type: Array,
      default: () => []
    },
    // 选择的测评点
    selectedMeasures: {
      type: Array,
      default: () => []
    },
    // 最大选择测评点数量
    maxSelectMeasures: {
      type: Number,
      default: 20
    },
    // 是否需要过滤测评点
    needFilterMeasures: {
      type: Boolean,
      default: false
    },
    // 单元基础数据
    unitBaseInfo: {
      type: Object,
      default: () => {}
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 测评点展示是否需要添加滚动条，需要则绑定测评点模块高度
    standardsViewScrollbarHeight: {
      type: Number,
      default: -1
    },
    useDomain: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      searchMeasureStr: '', // 搜索测评点的字符串
      measurePopoverVisible: false, // 测评点下拉框是否显示
      showEditView: true, // 是否显示编辑框
      defaultProps: {
        children: 'children',
        label: 'abbreviation'
      }, // 树形测评点下拉框展示配置
      measuresDataLoading: false, // 测评点数据加载状态
      previousSelectedMeasuresIds: [] // 上一次选择的测评点 id 列表
    }
  },
  computed: {
    ...mapState({
      curriculumBaseInfo: state => state.designer.baseInfo
    }),
    allMeasures () {
      if (this.needFilterMeasures) {
        let allMeasures = []
        // 先按照顶层领域过滤一遍
        allMeasures = this.domains.filter(domain => this.unitBaseInfo.domainIds.includes(domain.id))
        if (!this.useDomain) {
          // 然后在过滤后的领域再过滤底层测评点
          allMeasures = this.filterBottomMeasuresByMeasureIds(allMeasures, this.unitBaseInfo.measureIds)
        }
        return allMeasures || this.domains
      }
      return this.domains
    },
    // 测评点视窗高度
    standardsViewHeight () {
      return {
        maxHeight: this.haveStandardsViewHeight ? this.standardsViewScrollbarHeight + 'px' : 'auto'
      }
    },
    // 是否传入了视窗高度 prop 属性，如果传入了，那么说明是 Unit Planner 部分，否则是 curriculum 部分
    haveStandardsViewHeight () {
      return this.standardsViewScrollbarHeight !== -1
    }
  },
  watch: {
    // 搜索的字符串
    searchMeasureStr (val) {
      if (this.$refs.measuresDataTree) {
        this.$refs.measuresDataTree.filter(val)
      }
    },
    // 当前选择的测评点
    selectedMeasures () {
      this.setSelectedMeasures()
    },
    measurePopoverVisible (val) {
      if (!val) {
        // 1 秒后 清空搜索关键字
        setTimeout(() => {
          this.searchMeasureStr = ''
        }, 1000)
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.setSelectedMeasures()
    })
  },
  methods: {
    // 根据底层测评点 id 列表过滤掉树形结构的测评点数据
    filterBottomMeasuresByMeasureIds (domains, measureIds) {
      function filterMeasures (measures) {
        return measures
          .map(node => {
            // 递归过滤子节点
            const filteredChildren = node.children ? filterMeasures(node.children) : []
            // 判断当前节点是否是底层节点，并且它的 ID 是否在 measureIds 中
            const isBottomLayer = filteredChildren.length === 0
            const shouldRemove = isBottomLayer && !measureIds.includes(node.id)
            // 返回新节点对象，过滤掉应该被移除的节点
            return shouldRemove ? null : { ...node, children: filteredChildren }
          })
          .filter(node => node !== null) // 过滤掉 null 的节点
      }
      return filterMeasures(domains)
    },
    // 显示选中数量警告
    showLimitWarning () {
      let messageKey
      if (this.maxSelectMeasures === 20) {
        messageKey = 'loc.selectMeasureForOneWeek'
      } else if (this.maxSelectMeasures === 40) {
        messageKey = 'loc.selectMeasureForTwoWeeks'
      } else {
        messageKey = 'loc.selectMeasureForMoreWeeks'
      }
      this.$message({
        message: this.$t(messageKey),
        type: 'warning'
      })
    },
    // 选择测评点的处理函数
    selectMeasureHandle (currentMeasure, checkedNodesAndCheckedKeys) {
      const currentMeasureNode = this.$refs.measuresDataTree.getNode(currentMeasure)
      const isSelected = currentMeasureNode.checked
      let overCountMeasures = false
      // 只处理底层测评点的选中回调
      if (!currentMeasure.children || currentMeasure.children.length === 0) {
        if (this.handleBottomMeasure(currentMeasure, isSelected)) {
          this.showLimitWarning()
        }
      } else {
        // 如果当前节点是选中状态
        if (currentMeasureNode && isSelected) {
          let bottomMeasureNodes = []
          this.handleNotBottomMeasure(currentMeasureNode, bottomMeasureNodes)
          bottomMeasureNodes.slice().reverse().forEach(child => {
            // 如果子节点是选中状态，那么取消选中
            const overCount = this.handleBottomMeasure(child.data, child.checked)
            // 如果子节点超过最大选择个数，那么标记为超过最大选择个数
            if (!overCountMeasures && overCount) {
              overCountMeasures = true
            }
          })
          // 如果超过最大选择个数，那么显示警告
          if (overCountMeasures) {
            this.showLimitWarning()
          }
        }
      }
      // 更新选中的测评点
      this.updatedSelectedMeasures(overCountMeasures, currentMeasureNode)
    },
    handleNotBottomMeasure (currentMeasureNode, bottomMeasureNodes) {
      if (!currentMeasureNode) {
        return
      }
      if (!currentMeasureNode.childNodes || currentMeasureNode.childNodes.length === 0) {
        bottomMeasureNodes.push(currentMeasureNode)
        return
      }
      currentMeasureNode.childNodes.forEach(measureNode => {
        this.handleNotBottomMeasure(measureNode, bottomMeasureNodes)
      })
    },
    handleBottomMeasure (currentMeasure, isSelected) {
      // 获取所有底层测评点
      const selectedMeasures = this.$refs.measuresDataTree.getCheckedNodes(true, false)
      // 如果测评点最大选中个数，那么取消选中，并且不会更新测评点状态
      if (isSelected && selectedMeasures.length > this.maxSelectMeasures) {
        // 超过最大限制，取消当前底层节点及其上层节点的选中状态
        this.cancelMeasureAndMeasureParentsIfNoChildrenMeasureSelected(currentMeasure)
        return true
      }
      return false
    },
    // 取消当前测评点和其所有没有子节点被选中的上层节点的选中状态
    cancelMeasureAndMeasureParentsIfNoChildrenMeasureSelected (measure) {
      // 取消当前节点的选中状态
      this.$refs.measuresDataTree.setChecked(measure.id, false)
      // 递归取消父节点的选中状态，前提是父节点下没有其他被选中的子节点
      let parentMeasure = measure.parent
      const checkedMeasures = this.$refs.measuresDataTree.getCheckedNodes(false, false)
      while (parentMeasure) {
        const childrenMeasure = parentMeasure.children || []
        // 判断是否有被选中的子节点
        const hasCheckedChild = childrenMeasure.some(child => checkedMeasures.includes(child))
        // 如果没有被选中的测评点，那么则取消选中状态
        if (!hasCheckedChild) {
          this.$refs.measuresDataTree.setChecked(parentMeasure.id, false)
        }
        parentMeasure = parentMeasure.parent
      }
    },
    getNewAddMeasureIds (currentMeasureNode, count, measureIds = []) {
      if (count === 0) {
        return
      }
      if (currentMeasureNode.childNodes === 0 && !this.previousSelectedMeasuresIds.includes(currentMeasureNode.id)) {
        measureIds.push(currentMeasureNode.id)
        count--
        return
      }
      currentMeasureNode.childNodes.forEach(child => {
        this.getNewAddMeasureIds(child, count, measureIds)
      })
    },
    // 更新选择的测评点数据
    updatedSelectedMeasures (overCountMeasures = false, currentMeasureNode = null) {
      let selectedMeasureIds = []
      let selectDomainIds = []
      if (overCountMeasures && currentMeasureNode && currentMeasureNode.childNodes.length !== 0) {
        const newAddMeasureIds = []
        this.getNewAddMeasureIds(currentMeasureNode, this.maxSelectMeasures - this.previousSelectedMeasuresIds.length, newAddMeasureIds)
        selectedMeasureIds = [...this.previousSelectedMeasuresIds, ...newAddMeasureIds]
        this.$refs.measuresDataTree.setCheckedKeys(selectedMeasureIds)
        // 通过底层测评点收集顶层领域 id 列表
        selectDomainIds = this.getDomainIdsByMeasureMeasureIds(selectedMeasureIds)
      } else {
        // 获取当前已经选中的测评点，只包含最底层的测评点，不包含半选中的或者全选中的领域节点
        const selectedMeasures = this.$refs.measuresDataTree.getCheckedNodes(true, false)
        if (selectedMeasures) {
          selectedMeasures.forEach(measure => {
            // 如果是底层测评点
            if (!measure.children || measure.children.length === 0) {
              selectedMeasureIds.push(measure.id)
            }
          })
          // 通过底层测评点收集顶层领域 id 列表
          selectDomainIds = this.getDomainIdsByMeasureMeasureIds(selectedMeasureIds)
        }
      }
      // 更新选择的测评点
      this.$emit('updateSelectedMeasure', selectedMeasureIds, selectDomainIds)
    },
    // 设置测评点数据的选择状态
    setSelectedMeasures () {
      this.$refs.measuresDataTree.setCheckedKeys(this.selectedMeasures.map(item => item.id))
    },
    // 过滤测评点数据
    filterNode (value, data) {
      // 仅输入空格,不会影响节点的展开状态
      if (!value || !value.trim()) {
        return true
      }
      const lowerValue = value.toLowerCase().trim()
      return (data.abbreviation && data.abbreviation.toLowerCase().indexOf(lowerValue) !== -1) ||
        (data.name && data.name.toLowerCase().indexOf(lowerValue) !== -1) ||
        (data.description && data.description.toLowerCase().indexOf(lowerValue) !== -1)
    },
    // 删除当前选中的测评点
    removeSelectedItem (deleteMeasure) {
      let selectedMeasures = JSON.parse(JSON.stringify(this.selectedMeasures))
      selectedMeasures = selectedMeasures.filter(measure => measure.id !== deleteMeasure.id)
      this.$refs.measuresDataTree.setCheckedNodes(selectedMeasures)
      this.updatedSelectedMeasures()
    },
    // 根据底层测评点 id 列表获取领域 id 列表
    getDomainIdsByMeasureMeasureIds (measureIds) {
      // 使用 set 对顶层领域 id 进行去重
      let domainIds = new Set()
      if (measureIds && measureIds.length > 0) {
        measureIds.forEach(measureId => {
          // 根据底层测评点 id 获取顶层领域 id
          const domainId = this.findDomainIdByMeasureId(this.allMeasures, measureId)
          if (domainId) {
            domainIds.add(domainId)
          }
        })
      }
      return Array.from(domainIds)
    },
    // 根据测评点 id 找到其所属的顶层领域 id
    findDomainIdByMeasureId (domains, measureId) {
      // 深度遍历获取顶层领域 id
      function dfsFindDomainId (currentMeasureNode, domainId = null) {
        // 如果当前节点的 id 等于目标测评点 id ，那么直接返回顶层的 domain id
        if (currentMeasureNode.id === measureId) {
          return domainId
        }
        // 遍历当前节点的所有子节点（测评点）
        if (currentMeasureNode.children && currentMeasureNode.children.length > 0) {
          for (const child of currentMeasureNode.children) {
            // 遍历下一层
            const topDomainId = dfsFindDomainId(child, domainId || currentMeasureNode.id)
            // 如果成功找到，那么直接返回结果
            if (topDomainId) {
              return topDomainId
            }
          }
        }
        return null
      }
      // 遍历所有顶层领域，查找测评点所属的顶层领域
      for (const domain of domains) {
        const topDomainId = dfsFindDomainId(domain)
        if (topDomainId) {
          return topDomainId
        }
      }
      return null
    },
    // 渲染树形节点内容
    renderMeasuresContent (h, { node, data }) {
      // name 样式
      const nameStyle = {
        color: '#111C1C',
        fontSize: '14px'
      }
      // description 样式
      const descriptionStyle = {
        color: '#999',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        maxWidth: 'calc(100% - 40px)' // 留出其他元素的空间，例如树形节点的展开/折叠按钮
      }
      // 如果同时有名字和缩写，展示缩写：名字
      if (data.name && data.abbreviation) {
        // 如果名字和缩写相同，只显示名字
        if (data.name === data.abbreviation) {
          return h('span', { style: nameStyle }, data.name)
        }
        return h('span', [
          h('span', { style: nameStyle }, data.abbreviation),
          h('span', { style: nameStyle }, ': '),
          h('span', { style: nameStyle }, data.name)
        ])
      }
      // 如果没有描述，展示名字或缩写
      if (!data.description) {
        return h('span', { style: descriptionStyle }, [
          h('span', { style: nameStyle }, data.name || data.abbreviation)
        ])
      }
      // 如果不同时有名字和缩写，展示缩写和描述
      return h('el-tooltip', {
        props: {
          effect: 'light',
          content: data.description,
          placement: 'top'
        }
      }, [
        h('span', { style: descriptionStyle }, [
          h('span', { style: nameStyle }, data.abbreviation),
          h('span', { style: nameStyle }, ': '),
          h('span', { style: descriptionStyle }, data.description)
        ])
      ])
    },
    // 关闭下拉框
    closePopover () {
      this.measurePopoverVisible = false
    },
    // 展示测评点下拉框，给外部调用
    showDropdown () {
      // 如果是禁用状态则不允许触发
      if (this.disabled) {
        return
      }
      this.measurePopoverVisible = true
    }
  }

}

</script>

<style scoped lang="less">
.active-border {
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid !important;
  border-left-style: solid;
  border-width: 2px !important;
  border-color: #10b3b7 !important;
  font-size: 15px;
}

.focused-input .el-input__inner {
  border: 1px dashed #10B3B7; /* 点击时显示虚线边框 */
}

.measure {
  min-height: 87px;
  width: 100%;
  height: 100%;
  position: relative;
  padding: 10px;
}

.do-week button {
  background-color: white;
  position: relative;
  height: 15px;
  width: 15px;
  border-radius: 100%;
  border: 1px solid
}

.do-week button span {
  position: absolute;
  top: 1px;
  left: 1px;
  font-size: 11px;
  font-weight: 700;
}

.do-week button:first-child {
  margin-bottom: 6px;
}

.after .measure:last-child {
  border-bottom: 0;
}

.measures-font {
  color: var(--color-text-placeholder);
}

.measures-font-focus {
  color: #10b3b7;
}

.focus-color :focus {
  border-color: blue; /* 边框颜色变为蓝色 */
  box-shadow: 0 0 5px rgba(0, 0, 255, 0.5); /* 添加阴影效果 */
}
.measure-area {
  padding: 5px 10px;
  min-height: 60px;
  max-height: 300px;
  overflow-y: auto;
}
.measures-tree-container {
  flex-grow: 1;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}
/deep/ .measures-tree-popover > .el-popover__reference-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
}

.measure .h-full{
  max-height: 390px;
}

</style>
<style>
.cg-measures-tree-dropdown {
  max-width: 70vh;
}
</style>
