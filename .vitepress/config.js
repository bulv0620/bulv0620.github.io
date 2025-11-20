import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'

const pageSize = 10

export default defineConfig({
    lang: 'zh-CN',
    sitemap: {
        hostname: 'https://bulv.cc'
    },
    title: 'bulv.cc',
    description: 'bulv.cc,javascript developer',
    base:'/',
    cacheDir: './node_modules/vitepress_cache',
    ignoreDeadLinks: true,
    themeConfig: {
        posts: await getPosts(pageSize),
        website: 'https://github.com/bulv0620', //copyright link
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Blogs', link: '/blogs/index' },
            { text: 'Archives', link: '/pages/archives' },
            { text: 'Tags', link: '/pages/tags' },
        ],
        search: {
          provider: 'local',
        },
        //outline:[2,3],
        outlineTitle: '文章摘要',
        socialLinks: [{ icon: 'github', link: 'https://github.com/bulv0620' }]
    },

    srcExclude: ['README.md'], // exclude the README.md , needn't to compiler

    vite: {
        //build: { minify: false }
        server: { port: 5000 }
    }
    /*
      optimizeDeps: {
          keepNames: true
      }
      */
})
