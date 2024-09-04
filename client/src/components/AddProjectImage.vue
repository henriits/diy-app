<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn } from '@/stores/user';
import type { ImagePublic } from '@server/shared/types';

// Props for project ID
const props = defineProps<{
    projectId: number;
}>();

// Refs for handling file upload
const fileInput = ref<HTMLInputElement | null>(null);
const previewSrc = ref<string | null>(null);
const message = ref<string>('');
const messageClass = ref<string>('');
const fileName = ref<string>('');
const uploadedFileUrl = ref<string | null>(null);

// Refs for handling URL submission
const newImage = ref<string>('');
const Images = ref<ImagePublic[]>([]);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

// Define public key for Uploadcare
const UploadCareKey = import.meta.env.VITE_UPLOADCARE_PUB_KEY;
const pubkey = UploadCareKey;

// Function to fetch images related to the project
const fetchImages = async () => {
    Images.value = await trpc.projectImages.findByProjectId.query({ projectId: props.projectId });
};

// Function to handle file change event
const onFileChange = () => {
    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];
        fileName.value = file.name;
    }
};

// Function to handle file upload
const uploadFile = async () => {
    const maxSize = 6 * 1024 * 1024; // 6MB

    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];

        if (file.size > maxSize) {
            message.value = 'File size exceeds limit of 6MB';
            messageClass.value = 'error';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('UPLOADCARE_PUB_KEY', pubkey);
        formData.append('filename', file.name);

        message.value = 'Uploading file...';
        messageClass.value = '';

        try {
            const response = await fetch('https://upload.uploadcare.com/base/', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to upload file.');
            }

            const data = await response.json();
            const fileUrl = `https://ucarecdn.com/${data.file}/${file.name}`;

            // Update UI with success message and file preview
            message.value = 'File uploaded successfully';
            messageClass.value = 'success';
            previewSrc.value = fileUrl;
            uploadedFileUrl.value = fileUrl;
            console.log('Uploaded file URL:', fileUrl);

            // Auto-submit the uploaded file URL to the project
            newImage.value = fileUrl;
            await submitImage();

        } catch (error) {
            console.error('Upload Error:', error);
            message.value = 'Error uploading file. Please try again.';
            messageClass.value = 'error';
        }
    } else {
        message.value = 'Please select a file to upload.';
        messageClass.value = 'error';
    }
};

// Function to handle image URL submission
const submitImage = async () => {
    if (!newImage.value.trim()) {
        error.value = 'Image cannot be empty.';
        setTimeout(() => { error.value = null; }, 2000);
        return;
    }

    try {
        await trpc.projectImages.addImage.mutate({
            projectId: props.projectId,
            imageUrl: newImage.value,
        });
        successMessage.value = 'Image submitted successfully!';
        setTimeout(() => { successMessage.value = null; }, 2000);
        newImage.value = ''; // Clear the input
        await fetchImages(); // Refresh the Images list
    } catch (err) {
        error.value = 'Failed to submit Image. Please try again later.';
        setTimeout(() => { error.value = null; }, 2000);
    }
};

onMounted(fetchImages);

</script>
<template>
    <div v-if="isLoggedIn" class="image-component">
        <div class="image-header">
            <strong class="Image">{{ }}</strong>
        </div>

        <!-- File Upload Section -->
        <div>
            <h1>File Uploader</h1>
            <form @submit.prevent="uploadFile">
                <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" />
                <button type="submit">Upload file</button>
            </form>
            <p :class="messageClass">{{ message }}</p>
            <img v-if="previewSrc" :src="previewSrc" :alt="fileName" width="300" />
        </div>

        <!-- URL Submission Section -->
        <textarea v-model="newImage" placeholder="Add URL here" rows="1" class="image-input"></textarea>
        <button type="button" @click="submitImage" class="submit-button">Submit Image</button>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="error" class="error-message">{{ error }}</div>
    </div>
    <div v-else class="not-logged-in">Please login to Image on the project!</div>
</template>
<style scoped>
/* Add your styles here */
</style>
