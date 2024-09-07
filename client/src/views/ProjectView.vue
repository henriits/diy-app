<script setup lang="ts">
import { trpc } from '@/trpc';
import type { ProjectPublic, RatingPublic } from '@server/shared/types';
import { FwbHeading } from 'flowbite-vue';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import { isLoggedIn, authUserId } from '@/stores/user';
import { formatInstructions } from '@/utils/formatInstructions';
import Rating from '@/components/Rating.vue';
import Comment from '@/components/Comments.vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

const isOpen = ref(false)

function closeModal() {
  isOpen.value = false
}
function openModal() {
  isOpen.value = true
}

const route = useRoute();
const router = useRouter();
const project = ref<ProjectPublic & { username: string } | undefined>(undefined);
const ratings = ref<RatingPublic[]>([]);
const imageUrl = ref<string | null>(null); // Ref to store the image URL
const isLoading = ref(true);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showDeleteConfirm = ref(false);

const fetchProjectAndRatings = async () => {
  try {
    const projectId = Number(route.params.id);
    const projectFound = await trpc.projects.findById.query(projectId);
    project.value = projectFound;

    // Fetch the image URL for the project
    imageUrl.value = await trpc.projectImages.getUrlByProjectId.query({ projectId }); // Fetch the image URL

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
    }, 2000);
  } catch (err) {
    error.value = 'Failed to delete project. Please try again later.';
  }
};

</script>
<template>
  <div class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <!-- Login Reminder -->
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8 text-center">
      <p>Please log in to view the project!</p>
    </div>

    <!-- Project Details -->
    <div v-else>
      <!-- Loading, Error, and Success Messages -->
      <div v-if="isLoading" class="text-center text-gray-500">Loading...</div>
      <div v-if="error" class="text-center text-red-500">{{ error }}</div>
      <div v-if="successMessage" class="text-center text-green-500">{{ successMessage }}</div>

      <div v-if="project" class="p-6">
        <FwbHeading tag="h1" class="mb-8 mt-10 text-3xl font-bold">
          {{ project.title }}
        </FwbHeading>

        <div class="flex flex-col md:flex-row items-start">
          <!-- Image Section -->
          <div class="w-full md:w-1/3 mb-6 md:mb-0">
            <img
              :src="imageUrl || 'https://media.istockphoto.com/id/173033514/photo/tools-of-a-carpenter.jpg?s=612x612&w=0&k=20&c=hv3o7RuzbPM-9aWSjApjSOIHygKy04raW5aZncUxRQY='"
              alt="Project Image" class="w-full h-auto object-cover rounded-lg shadow-md" />
            <!-- Button to Trigger Modal -->
            <button type="button" @click="openModal" class="large-img-button w-full">
              View Larger Image
            </button>
          </div>



          <!-- Content Section -->
          <div class="w-full md:w-2/3 md:pl-6">
            <Card class="relative p-6 bg-white shadow-lg rounded-lg">
              <p class="font-semibold">Author: {{ project.username }}</p>
              <p class="mt-4"><strong>Description:</strong> {{ project.description }}</p>
              <p class="mt-4"><strong>Instructions:</strong> <span
                  v-html="formatInstructions(project.instructions)"></span></p>
              <p class="mt-4"><strong>Materials:</strong> {{ project.materials }}</p>
              <p class="mt-4"><strong>Created At:</strong> {{ new Date(project.createdAt).toLocaleDateString() }}</p>
              <br>
              <h2 v-if="totalRating" class="text-lg">Rating: {{ totalRating }} ★</h2>
              <p v-else class="text-lg">No ratings yet.</p>

              <!-- Buttons -->
              <div v-if="project.userId === authUserId" class="absolute bottom-4 right-4 flex space-x-4">
                <button @click="goToEditPage" class="edit-button">
                  <img class="edit-svgIcon" src="../assets/icons/edit-icon.svg" alt="Edit Icon">
                </button>
                <button @click="initiateDelete" class="delete-button">
                  <img class="delete-svgIcon" src="../assets/icons/delete-icon.svg" alt="Delete Icon">
                </button>
              </div>
            </Card>

            <!-- Confirmation Prompt -->
            <div v-if="showDeleteConfirm" class="p-4 border rounded-lg bg-white shadow-md mt-4">
              <p class="text-red-600">Are you sure you want to delete this project?</p>
              <div class="mt-2 flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <button @click="deleteProject" class="confirm-cancel-button">
                  <img src="../assets/icons/confirm-icon.svg" alt="Confirm icon">
                </button>
                <button @click="cancelDelete" class="confirm-cancel-button">
                  <img src="../assets/icons/cancel-icon.svg" alt="Cancel Icon">
                </button>
              </div>
            </div>

            <!-- Create Rating Section -->
            <div v-if="project.userId !== authUserId" class="mt-6 w-full">
              <Rating :projectId="project.id" @rating-submitted="fetchProjectAndRatings" />
            </div>

            <!-- Create Comments Section -->
            <div class="mt-6 w-full">
              <Comment :projectId="project.id" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal for Larger Image -->
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-10">
        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <img
                  :src="imageUrl || 'https://media.istockphoto.com/id/173033514/photo/tools-of-a-carpenter.jpg?s=612x612&w=0&k=20&c=hv3o7RuzbPM-9aWSjApjSOIHygKy04raW5aZncUxRQY='"
                  alt="Larger Project Image" class="w-full h-auto rounded-lg" />
                <div class="mt-4">
                  <button type="button" class="large-img-button w-full" @click="closeModal">
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>



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
