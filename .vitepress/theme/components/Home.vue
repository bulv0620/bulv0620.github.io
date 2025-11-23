<template>
    <div class="about">
        <img class="avatar" src="../assets/images/avatar.png" alt="avatar" />
        <h1 class="welcome">
            <span id="welcome"></span>
        </h1>
        <p class="description">A JavaScript Developer.</p>

        <!-- skills -->
        <div class="skills">
            <div class="skill-wrapper">
                <div class="skill-item">
                    <i class="fa-brands fa-vuejs"></i>
                    <span>Vue.js</span>
                </div>
                <div class="skill-item">
                    <i class="fa-solid fa-atom"></i>
                    <span>Electron</span>
                </div>
                <div class="skill-item">
                    <i class="fa-solid fa-code"></i>
                    <span>NestJs</span>
                </div>
            </div>
        </div>

        <!-- projects -->
        <div class="projects">
            <div class="projects-title">Projects</div>
            <a class="project-card" href="https://bridge.bulv.cc" target="_blank">
                <img class="project-icon" src="../assets/images/bridge-icon.png" alt="icon" />
                <div class="project-info">
                    <h3>Bridge</h3>
                    <p>A cross-platform file synchronization tool.</p>
                </div>
            </a>
        </div>

        <!-- to blogs -->
        <div class="to-blog">
            <a class="blog-button" href="/blogs">Blogs &gt;</a>
        </div>
    </div>
</template>

<script setup>
import Typed from 'typed.js'
import { onMounted } from 'vue'

onMounted(() => {
    new Typed('#welcome', {
        strings: [`Hello, I'm bulv.`],
        typeSpeed: 100,
    })
})
</script>

<style scoped>
.about {
    padding-top: 12px;
}

.avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    margin: 12px auto;
    padding: 0;
}

.welcome {
    margin: 12px auto;
    padding: 0;
    text-align: center;
    white-space: nowrap;
    display: flex;
    justify-content: center;
}

.description {
    color: var(--vp-c-text-2);
    margin: 12px auto;
    padding: 0;
    text-align: center;
}

/* Skills */
.skills {
    text-align: center;
    margin: 12px auto;
    padding: 0;
}

.skills .skill-wrapper {
    display: flex;
    gap: 12px;
    list-style: none;
    padding: 0;
    justify-content: center;
}

.skills .skill-wrapper .skill-item {
    background: var(--vp-c-bg-soft);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;

    display: flex;
    gap: 6px;
    align-items: center;
}

/* Projects */
.projects {
    width: 100%;
    max-width: 400px;
    margin: 12px auto;
    padding: 0;
}

.projects .projects-title {
    padding-top: 0;
    margin: 0;
    color: var(--vp-c-text-2);
}

.projects .project-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    cursor: pointer;
}

.projects .project-card .project-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
}

.projects .project-card .project-info {
    flex: 1;
    overflow: hidden;
}

.projects .project-card .project-info h3 {
    margin: 0;
    font-size: 18px;
}

.projects .project-card .project-info p {
    line-height: 18px;
    margin: 0;
    font-size: 14px;
    color: var(--vp-c-text-2);
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* To Blog Button */
.to-blog {
    margin: 12px auto;
    padding: 0;
    text-align: center;
}

.to-blog .blog-button {
    display: inline-block;
    padding: 6px 12px;
    /* background: var(--vp-c-bg-soft); */
    border-radius: 8px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    font-size: 14px;
    transition: background 0.2s ease, transform 0.2s ease;
}

.to-blog .blog-button:hover {
    background: var(--vp-c-bg-mute);
    transform: translateY(-2px);
}
</style>
