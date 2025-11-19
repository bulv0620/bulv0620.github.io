<template>
    <div class="about">
        <img class="avatar" src="../assets/images/avatar.jpg" alt="avatar" />
        <h1>Hello, I'm Bulv.</h1>
        <p class="description">A JavaScript Developer.</p>

        <!-- skills -->
        <div class="skills">
            <!-- <h2 class="skills-title">Skills</h2> -->
            <div class="skill-wrapper">
                <div class="skill-item" v-for="(skill, index) in skills" :key="index">
                    <i :class="skill.iconClass"></i>
                    <span>{{ skill.label }}</span>
                </div>
            </div>
        </div>

        <!-- projects -->
        <div class="projects">
            <h2 class="projects-title">Projects</h2>
            <a class="project-card" v-for="(project, index) in projects" :key="index" :href="project.url" target="_blank">
                <img class="project-icon" :src="project.icon" alt="icon" />
                <div class="project-info">
                    <div>{{ project.title }}</div>
                    <p :title="project.description">{{ project.description }}</p>
                </div>
            </a>
        </div>

        <!-- to blogs -->
        <div class="to-blog">
            <a class="blog-button" href="/pages/blogs">Blogs &gt;</a>
        </div>
    </div>
</template>

<script lang="ts" setup>
import BridgeIcon from "../assets/images/bridge-icon.png";

const skills = [
    {
        label: 'Vue.js',
        iconClass: 'fa-brands fa-vuejs'
    },
    {
        label: 'Electron',
        iconClass: 'fa-solid fa-atom'
    },
    {
        label: 'NestJs',
        iconClass: 'fa-solid fa-code'
    },
];

const projects = [
    {
        icon: BridgeIcon,
        title: "Bridge",
        description:
            "A cross-platform file synchronization tool.",
        url: 'https://github.com/bulv0620/Bridge'
    },
    // {
    //     icon: UacIcon,
    //     title: "UAC-Template",
    //     description:
    //         "A user access ctrl template.",
    //     url: 'https://github.com/bulv0620/UAC-template'
    // },
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

    display: flex;
    gap: 6px;
    align-items: center;
}

/* Projects */
.projects {
    width: 100%;
    max-width: 400px;
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
    cursor: pointer;
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

/* To Blog Button */
.to-blog {
    margin-top: 18px;
}

.blog-button {
    display: inline-block;
    padding: 6px 12px;
    /* background: var(--vp-c-bg-soft); */
    border-radius: 8px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    font-size: 14px;
    transition: background 0.2s ease, transform 0.2s ease;
}

.blog-button:hover {
    background: var(--vp-c-bg-mute);
    transform: translateY(-2px);
}
</style>
