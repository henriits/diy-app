<script setup lang="ts">
import { trpc } from '@/trpc'
import type { ProjectPublic, CommentPublic } from '@server/shared/types'
import { FwbButton, FwbHeading, FwbInput } from 'flowbite-vue'
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/Card.vue'
import { isLoggedIn } from '@/stores/user'

const route = useRoute()
const project = ref<ProjectPublic>()

const projectId = Number(route.params.id)

onBeforeMount(async () => {
  // Promise.all allows to run multiple promises in parallel.
  const [projectFound] = await Promise.all([
    trpc.projects.findById.query(projectId),
  ])

  project.value = projectFound
})







</script>

<template>
  <div v-if="project">
    <FwbHeading tag="h1" class="mb-8 mt-10">
      {{ project.title }}
    </FwbHeading>

    <Card>
      {{ project.description }}
      <br>
      {{ project.instructions }}
      <br>
      {{ project.materials }}
      <br>
      {{ project.createdAt }}
    </Card>



  </div>
</template>
