<script setup lang="ts">
import { ElButton } from 'element-plus'

async function selectFolder() {
  const result = await window.api.selectFolder()
  console.log('result', result)
}
</script>

<template>
  <div>
    <div></div>
    <el-button type="primary" @click="selectFolder">选择文件夹</el-button>
  </div>
</template>

<style lang="less">
@import './assets/css/styles.less';
</style>
