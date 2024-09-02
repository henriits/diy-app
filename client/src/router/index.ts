import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticate } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: MainLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: 'create-project',
          name: 'CreateProject',
          component: () => import('../views/CreateProject.vue'),
        },
        {
          path: 'edit-project/:id',
          name: 'EditProject',
          component: () => import('../views/EditProject.vue'),
        },
        {
          path: 'my-projects',
          name: 'MyProjects',
          component: () => import('../views/MyProjects.vue'),
        },
        /*         {
          path: 'categories',
          name: 'AllCategories',
          component: () => import('../views/CategoryList.vue'),
        },  Will leave for future implementation */
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: 'project/:id',
          name: 'Projects',
          component: () => import('../views/ProjectView.vue'),
        },
        {
          path: '',
          name: 'Home',
          component: HomeView,
          props: (route) => ({ searchQuery: route.query.q || '' }),
        },
      ],
    },
  ],
})

export default router
