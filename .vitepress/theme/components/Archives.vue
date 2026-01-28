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

.posts {
    padding: 4px 0 4px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.post-dot {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 3px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--li-dot-color);
}

.post-container {
    color: var(--vp-c-text-2);
    font-size: 0.9375rem;
    font-weight: 400;
}
.post-container:hover {
    color: var(--vp-c-brand);
}
.date {
    color: var(--date-color);
}

@media screen and (max-width: 768px) {
    .posts {
        padding: 4px;
    }
    .post-dot {
        margin-right: 4px;
    }
    .post-container {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 16.5em;
    }
}
</style>
