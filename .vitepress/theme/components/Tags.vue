<template>
    <div class="tag-page">
        <div class="tags-nav">
            <span
                v-for="tag in tagList"
                :key="tag.tagName"
                class="tag-item"
                :class="{ active: selectTag === tag.tagName }"
                @click="toggleTag(tag.tagName)"
            >
                {{ tag.tagName }}
                <sup class="count">{{ tag.postList.length }}</sup>
            </span>
        </div>

        <div class="tag-bg-title">
            {{ selectTag }}
        </div>

        <div class="list-wrapper">
            <a
                v-for="(article, index) in data[selectTag]"
                :key="index"
                :href="withBase(article.regularPath)"
                class="posts"
            >
                <div class="post-container">
                    <div class="post-dot"></div>
                    {{ article.frontMatter.title }}
                </div>
                <div class="date">{{ article.frontMatter.date.slice(5) }}</div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { initTags } from '../functions'

const { theme } = useData()

let url = location.href.split('?')[1]
let params = new URLSearchParams(url)

const data = computed(() => initTags(theme.value.posts))
const tagList = computed(() => {
    return Object.keys(data.value)
        .map((key) => ({
            tagName: key,
            postList: data.value[key]
        }))
        .sort((a, b) => b.postList.length - a.postList.length)
})

let selectTag = ref(params.get('tag') ? params.get('tag') : (tagList.value.length > 0 ? tagList.value[0].tagName : ''))

const toggleTag = (tag) => {
    selectTag.value = tag
}
</script>

<style scoped>
.tag-page {
    padding: 14px 0 14px 0;
}
/* 标签选择器：去掉背景色块，改用下划线和加粗 */
.tags-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    border-bottom: 1px solid var(--vp-c-divider);
    padding-bottom: 1.5rem;
}

.tag-item {
    cursor: pointer;
    font-size: 1rem;
    color: var(--vp-c-text-2);
    transition: all 0.2s ease;
    position: relative;
    font-weight: 500;
}

.tag-item:hover,
.tag-item.active {
    color: var(--vp-c-text-1);
}

.tag-item.active::after {
    content: '';
    position: absolute;
    bottom: -0.2rem;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--vp-c-brand);
}

.count {
    font-size: 0.7rem;
    margin-left: 2px;
    opacity: 0.4;
}

.tag-bg-title {
    margin-top: 2rem;
    font-size: 4rem;
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
    .tag-bg-title {
        font-size: 2rem;
        margin-top: 1rem;
    }
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
