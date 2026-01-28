<template>
    <Layout>
        <template #doc-before>
            <div style="padding-top: 20px" class="post-info" v-if="!$frontmatter.page">
                {{ $frontmatter.date?.substring(0, 10) }}
                &nbsp;&nbsp;
                <span v-for="item in $frontmatter.tags" :key="item">
                    <a :href="withBase(`/pages/tags.html?tag=${item}`)"> {{ item }}</a>
                </span>
            </div>
        </template>
    </Layout>
    <Copyright />
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import Copyright from './Copyright.vue'
import { withBase } from 'vitepress'
const { Layout } = DefaultTheme
</script>

<style scoped>
.post-info {
    font-size: 12px;
}

.post-info span {
    display: inline-block;
    padding: 0 8px;
    background-color: var(--vp-c-bg-alt);
    margin-right: 6px;
    margin-bottom: 4px;
    transition: 0.4s;
    border-radius: 2px;
    color: var(--vp-c-text-1);
}
</style>
