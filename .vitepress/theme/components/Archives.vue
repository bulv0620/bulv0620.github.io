<template>
    <div v-for="yearList in data" class="wrapper">
        <div class="year">
            {{ yearList[0].frontMatter.date.split('-')[0] }}
        </div>
        <a :href="withBase(article.regularPath)" v-for="(article, index) in yearList" :key="index" class="posts">
            <div class="post-container">
                <div class="post-dot"></div>
                {{ article.frontMatter.title }}
            </div>
            <div class="date">{{ article.frontMatter.date.slice(5) }}</div>
        </a>
    </div>
</template>

<script setup>
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'
import { useYearSort } from '../functions'

const { theme } = useData()
const data = computed(() => useYearSort(theme.value.posts))
</script>

<style scoped>
.wrapper {
    margin: 24px 0 48px;
}
.year {
  font-size: 5rem;
  font-weight: 800;
  color: transparent;
  -webkit-text-stroke: 2px var(--vp-c-gray-soft);
  text-transform: uppercase;
  user-select: none;
  word-break: break-all;
}
</style>
