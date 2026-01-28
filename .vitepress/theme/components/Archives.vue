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
    color: transparent;              /* 中间透明 */
    -webkit-text-stroke: 4px var(--vp-c-gray-soft);    /* 描边 */
    user-select: none;
}
</style>
