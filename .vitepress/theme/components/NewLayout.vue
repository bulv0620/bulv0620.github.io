<template>
    <Layout>
        <template #doc-before>
            <div style="padding-top: 20px" class="post-info" v-if="!$frontmatter.page">
                {{ $frontmatter.date?.substring(0, 10) }}
                &nbsp;&nbsp;
                <span class="tag" v-for="item in $frontmatter.tags" :key="item">
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

<style>
.tag {
    margin-bottom: 4px;
}
</style>
