// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import DownloadPage from '@/pages/DownloadPage.vue';
import UploadPage from '@/pages/UploadPage.vue';

const routes = [
    { path: '/', component: HomePage },
    { path: '/download/:token', component: DownloadPage },
    { path: '/upload/:token', component: UploadPage },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});