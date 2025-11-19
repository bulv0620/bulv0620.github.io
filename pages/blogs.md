---
page: true
title: blogs
aside: false
---
<script setup>
import Blogs from "../.vitepress/theme/components/Blogs.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(0,10)
</script>
<Blogs :posts="posts" :pageCurrent="1" :pagesNum="1" />
