<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { isLoggedIn, logout, username } from '@/stores/user'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const links = computed(() => [
  { label: 'Home', name: 'Home' },

  ...(isLoggedIn.value
    ? [
      { label: 'My Projects', name: 'MyProjects' },
      { label: 'Create a project', name: 'CreateProject' },
      // { label: 'Category list', name: 'AllCategories' }
    ]
    : [
      { label: 'Login', name: 'Login' },
      { label: 'Signup', name: 'Signup' }
    ]),
])
function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <div class="menu-container">
        <FwbNavbarLink v-if="isLoggedIn" @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
        <span v-if="isLoggedIn" class="username">from {{ username }}</span>

      </div>
    </template>
  </StackedLayout>
</template>

<style scoped>
.menu-container {
  display: flex;
  align-items: center;
  /* Align items vertically in the center */
}

.menu-container>*:not(:last-child) {
  margin-right: 5px;

}
</style>
