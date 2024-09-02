<template>
  <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
    <div class="items-center lg:flex">Please Login to view the project!</div>
  </div>
  <div v-else>
    <div v-if="isLoading" class="text-center">Loading...</div>
    <div v-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-if="successMessage" class="text-center text-green-500">{{ successMessage }}</div>
    <div v-if="project" class="p-6">
      <FwbHeading tag="h1" class="mb-8 mt-10 text-3xl font-bold">
        {{ project.title }}
      </FwbHeading>
      <div class="flex flex-col md:flex-row items-start">
        <!-- Image Section -->
        <div class="flex-shrink-0 md:w-1/3 mb-6 md:mb-0">
          <img src="https://via.placeholder.com/800x1000" alt="Project Image"
            class="w-full h-auto rounded-lg shadow-md" />
        </div>
        <!-- Content Section -->
        <div class="flex-1 md:pl-6">
          <Card class="p-6 bg-white shadow-lg rounded-lg">
            <p class="font-semibold">Author: {{ project.username }}</p>
            <p class="mt-4"><strong>Description:</strong> {{ project.description }}</p>
            <p class="mt-4"><strong>Instructions:</strong> <span
                v-html="formatInstructions(project.instructions)"></span></p>
            <p class="mt-4"><strong>Materials:</strong> {{ project.materials }}</p>
            <p class="mt-4"><strong>Created At:</strong> {{ new Date(project.createdAt).toLocaleDateString() }}</p>
            <br>
            <h2 v-if="totalRating" class="text-lg">Rating: {{ totalRating }} ★</h2>
            <p v-else class="text-lg">No ratings yet.</p>
          </Card>
          <div v-if="project.userId === authUserId" class="mt-4 flex space-x-4">
            <FwbButton @click="goToEditPage" size="lg">Edit Project</FwbButton>
            <FwbButton @click="initiateDelete" size="lg" color="red">Delete Project</FwbButton>
          </div>
          <!-- Confirmation Prompt -->
          <div v-if="showDeleteConfirm" class="mt-4 p-4 border rounded-lg bg-white shadow-md">
            <p class="text-red-600">Are you sure you want to delete this project?</p>
            <div class="mt-2 flex space-x-4">
              <FwbButton @click="deleteProject" size="lg" color="red">Yes, Delete</FwbButton>
              <FwbButton @click="cancelDelete" size="lg">Cancel</FwbButton>
            </div>
          </div>
          <!-- Create Rating Section -->
          <!-- Only show the Rating component if the current user is not the project author -->
          <div v-if="project.userId !== authUserId">
            <Rating :projectId="project.id" @rating-submitted="fetchProjectAndRatings" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { trpc } from '@/trpc';
import type { ProjectPublic, RatingPublic } from '@server/shared/types';
import { FwbHeading, FwbButton } from 'flowbite-vue';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import { isLoggedIn, authUserId } from '@/stores/user';
import { formatInstructions } from '@/utils/formatInstructions';
import Rating from '@/components/Rating.vue';

const route = useRoute();
const router = useRouter();
const project = ref<ProjectPublic & { username: string } | undefined>(undefined);
const ratings = ref<RatingPublic[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showDeleteConfirm = ref(false);

const fetchProjectAndRatings = async () => {
  try {
    const projectId = Number(route.params.id);
    const projectFound = await trpc.projects.findById.query(projectId);
    project.value = projectFound;

    // Fetch ratings for the project
    ratings.value = await trpc.ratings.getByProjectId.query({ projectId });
  } catch (err) {
    error.value = 'Failed to load project details or ratings. Please try again later.';
    console.error(err); // Log the actual error for debugging
  } finally {
    isLoading.value = false;
  }
};

onBeforeMount(fetchProjectAndRatings);

// Function to calculate average rating
const totalRating = computed(() => {
  if (ratings.value.length === 0) return null;
  const totalRating = ratings.value.reduce((acc, rating) => acc + rating.rating, 0);
  return (totalRating / ratings.value.length).toFixed(1);
});

const goToEditPage = () => {
  router.push({ name: 'EditProject', params: { id: route.params.id } });
};

const initiateDelete = () => {
  showDeleteConfirm.value = true; // Show the confirmation prompt
};

const cancelDelete = () => {
  showDeleteConfirm.value = false; // Hide the confirmation prompt
};

const deleteProject = async () => {
  try {
    await trpc.projects.delete.mutate(Number(route.params.id));
    successMessage.value = 'Project deleted successfully';
    setTimeout(() => {
      router.push({ name: 'Home' });
    }, 2000); // Delay to show the success message
  } catch (err) {
    error.value = 'Failed to delete project. Please try again later.';
  }
};
</script>

<style scoped>
/* Add any additional styling here */
img {
  max-width: 100%;
  height: auto;
}

.project-image {
  width: 100%;
  max-width: 800px;
  height: auto;
  max-height: 1000px;
  object-fit: cover;
}
</style>
