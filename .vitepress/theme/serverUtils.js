import { globby } from 'globby'
import matter from 'gray-matter'
import fs from 'fs-extra'
import path, { resolve } from 'path'

async function getPosts(pageSize) {
    let paths = await globby(['posts/**.md'])

    //生成分页页面markdown
    await generatePaginationPages(paths.length, pageSize)

    let posts = await Promise.all(
        paths.map(async (item) => {
            const content = await fs.readFile(item, 'utf-8')
            const { data } = matter(content)
            data.date = _convertDate(data.date)
            return {
                frontMatter: data,
                regularPath: `/${item.replace('.md', '.html')}`
            }
        })
    )
    posts.sort(_compareDate)
    return posts
}

async function generatePaginationPages(total, pageSize) {
    //  pagesNum
    let pagesNum = total % pageSize === 0 ? total / pageSize : parseInt(total / pageSize) + 1
    const paths = resolve('./')
    if (total > 0) {
        for (let i = 1; i < pagesNum + 1; i++) {
            const page = `
---
page: true
title: Blogs
aside: false
---
<script setup>
import Blogs from "../.vitepress/theme/components/Blogs.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(${pageSize * (i - 1)},${pageSize * i})
</script>
<Blogs :posts="posts" :pageCurrent="${i}" :pagesNum="${pagesNum}" />
`.trim()
            const file = paths + `/blogs/page_${i}.md`
            await fs.ensureDir(path.dirname(file))
            await fs.writeFile(file, page)
        }
        await fs.move(paths + '/blogs/page_1.md', paths + '/blogs/index.md', { overwrite: true })
    }
}

function _convertDate(date = new Date().toString()) {
    const json_date = new Date(date).toJSON()
    return json_date.split('T')[0]
}

function _compareDate(obj1, obj2) {
    return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
}

export { getPosts }
