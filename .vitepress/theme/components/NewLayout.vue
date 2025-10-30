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
import { onMounted } from 'vue'
const { Layout } = DefaultTheme

onMounted(() => {
    const switchButton = document.querySelector('.VPSwitchAppearance')
    window.addEventListener(
        'click',
        (e) => {
            if (switchButton.contains(e.target)) {
                e.stopImmediatePropagation() // 阻止 Vue 的 @click
                e.preventDefault()
                toggleTheme(e)
            }
        },
        true // 捕获阶段
    )

    function toggleTheme(e) {
        const supportsViewTransition = !!document.startViewTransition
        if (!supportsViewTransition) {
            document.documentElement.classList.toggle('dark')
            return
        }

        const html = document.documentElement

        const transition = document.startViewTransition(() => {
            document.documentElement.classList.toggle('dark')
        })

        transition.ready.then(() => {
            const { clientX, clientY } = e
            const radius = Math.hypot(Math.max(clientX, innerWidth - clientX), Math.max(clientY, innerHeight - clientY))

            const clipPath = [
                `circle(0% at ${clientX}px ${clientY}px)`,
                `circle(${radius}px at ${clientX}px ${clientY}px)`
            ]

            const isDarkNow = html.classList.contains('dark')

            document.documentElement.animate(
                {
                    clipPath: isDarkNow ? clipPath.reverse() : clipPath
                },
                {
                    fill: 'both',
                    duration: 500,
                    pseudoElement: isDarkNow ? '::view-transition-old(root)' : '::view-transition-new(root)'
                }
            )
        })
    }
})
</script>

<style>
/* 额外基础动画保证兼容性 */
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
}

html.dark::view-transition-old(root) {
    z-index: 1000;
}
</style>
