<template>
    <div class="about">
        <img class="avatar" src="../assets/images/avatar.jpg" alt="avatar" />
        <h1>Hello, I'm Bulv.</h1>
        <p class="description">A JavaScript Developer.</p>

        <!-- skills -->
        <div class="skills">
            <!-- <h2 class="skills-title">Skills</h2> -->
            <div class="skill-wrapper">
                <div class="skill-item" v-for="(skill, index) in skills" :key="index">{{ skill }}</div>
            </div>
        </div>

        <!-- projects -->
        <div class="projects">
            <h2 class="projects-title">Projects</h2>
            <div class="project-card" v-for="(project, index) in projects" :key="index">
                <img class="project-icon" :src="project.icon" alt="icon" />
                <div class="project-info">
                    <h3>{{ project.title }}</h3>
                    <p :title="project.description">{{ project.description }}</p>
                </div>
            </div>
        </div>

        <p class="href">
            Theme from:
            <a href="https://github.com/airene/vitepress-blog-pure" target="_blank">vitepress-blog-pure</a>
        </p>
    </div>
</template>

<script lang="ts" setup>
import BridgeIcon from "../assets/images/bridge-icon.png";

const skills = ["Vue.js", "Electron", "NestJS"];

const projects = [
    {
        icon: BridgeIcon,
        title: "Bridge",
        description:
            "An open-source, cross-platform, and minimalist file synchronization and transfer tool.",
    },
];
</script>

<style scoped>
.about {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 24px;
}

.avatar {
    width: 180px;
    height: 180px;
    border-radius: 50%;
}

.description {
    color: var(--vp-c-text-2);
}

.href {
    color: var(--vp-c-text-2);
    margin: 0;
}

/* Skills */
.skills {
    text-align: center;
}

.skills-title {
    padding-top: 0;
}

.skills .skill-wrapper {
    display: flex;
    gap: 12px;
    list-style: none;
    padding: 0;
    justify-content: center;
}

.skills .skill-item {
    background: var(--vp-c-bg-soft);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;
}

/* Projects */
.projects {
    width: 100%;
    max-width: 450px;
}

.projects-title {
    padding-top: 0;
}

.project-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
}

.project-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
}

.project-info {
    flex: 1;
    overflow: hidden;
}

.project-info h3 {
    margin: 0;
    font-size: 18px;
}

.project-info p {
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
</style>
