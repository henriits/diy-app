<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { trpc } from '@/trpc';
import { isLoggedIn } from '@/stores/user';
import type { ImagePublic } from '@server/shared/types';

const props = defineProps<{
    projectId: number;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const message = ref<string>('');
const messageClass = ref<string>('');
const fileName = ref<string>('');
const uploadedFileUrl = ref<string | null>(null);

const newImage = ref<string>('');
const existingImage = ref<ImagePublic | null>(null);
const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);

const UploadCareKey = import.meta.env.VITE_UPLOADCARE_PUB_KEY;
const pubkey = UploadCareKey;

const fetchImages = async () => {
    try {
        const images = await trpc.projectImages.findByProjectId.query({ projectId: props.projectId });
        existingImage.value = images.length > 0 ? images[0] : null;
        // Update the uploadedFileUrl to reflect the current image
        uploadedFileUrl.value = existingImage.value ? existingImage.value.imageUrl : null;
    } catch (err) {
        console.error('Error fetching images:', err);
        error.value = 'Failed to fetch images. Please try again later.';
        setTimeout(() => { error.value = null; }, 5000);
    }
};

const onFileChange = () => {
    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];
        fileName.value = file.name;
    }
};

const uploadFile = async () => {
    const maxSize = 6 * 1024 * 1024; // 6MB

    if (fileInput.value && fileInput.value.files) {
        const file = fileInput.value.files[0];

        if (!file) {
            message.value = 'Please select a file to upload.';
            messageClass.value = 'error';
            return;
        }

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

            message.value = 'File uploaded successfully';
            messageClass.value = 'success';
            uploadedFileUrl.value = fileUrl;

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

const submitImage = async () => {
    if (!newImage.value.trim()) {
        error.value = 'Image URL cannot be empty.';
        setTimeout(() => { error.value = null; }, 5000);
        return;
    }

    try {
        if (existingImage.value) {
            // Update existing image
            await trpc.projectImages.updateByProjectId.mutate({
                projectId: props.projectId,
                imageUrl: newImage.value,
            });
            successMessage.value = 'Image updated successfully!';
        } else {
            // Add new image
            await trpc.projectImages.addImage.mutate({
                projectId: props.projectId,
                imageUrl: newImage.value,
            });
            successMessage.value = 'Image added successfully!';
        }
        setTimeout(() => { successMessage.value = null; }, 5000);
        newImage.value = '';
        await fetchImages(); // Fetch the latest image data
    } catch (err) {
        console.error('Submission Error:', err);
        error.value = 'Failed to submit image. Please try again later.';
        setTimeout(() => { error.value = null; }, 5000);
    }
};

onMounted(fetchImages);

// Watch for changes in the existing image to clear any stale state
watch(existingImage, (newVal) => {
    if (!newVal) {
        newImage.value = '';
    } else {
        uploadedFileUrl.value = newVal.imageUrl;
    }
});
</script>


<template>
    <div v-if="isLoggedIn" class="image-component">
        <img :src="uploadedFileUrl || 'https://via.placeholder.com/400x400'" alt="Project Image"
            class="rounded-lg shadow-md project-image w-full" loading="lazy" />
        <!-- File Upload Section -->
        <div class="upload-section" v-if="!existingImage">
            <form @submit.prevent="uploadFile" class="upload-form">
                <input type="file" ref="fileInput" accept="image/*" @change="onFileChange"
                    class="file-input mt-2 flex space-x-4" placeholder="image">
                <button type="submit" class="upload-button w-full">Upload</button>
            </form>
            <p :class="messageClass" class="upload-message">{{ message }}</p>
        </div>

        <!-- URL Submission Section -->
        <div v-if="!existingImage" class="url-section">
            <textarea v-model="newImage" placeholder="https:// add url here" rows="1"
                class="url-input w-full"></textarea>
            <button type="button" @click="submitImage" class="submit-button w-full">Submit URL</button>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            <div v-if="error" class="error-message">{{ error }}</div>
        </div>

        <!-- Update Image Section -->
        <div v-if="existingImage" class="update-section">
            <h1 class="title text-center">Update Image</h1>
            <form @submit.prevent="uploadFile" class="upload-form">
                <input type="file" ref="fileInput" accept="image/*" @change="onFileChange"
                    class="file-input mt-2 flex space-x-4" placeholder="image">
                <button type="submit" class="upload-button w-full">Update Image</button>
            </form>
            <p :class="messageClass" class="upload-message">{{ message }}</p>
            <div class="url-section">
                <textarea v-model="newImage" placeholder="https:// update url here" rows="1"
                    class="url-input w-full"></textarea>
                <button type="button" @click="submitImage" class="submit-button w-full">Submit URL</button>
            </div>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            <div v-if="error" class="error-message">{{ error }}</div>
        </div>
    </div>
    <div v-else class="not-logged-in">Please log in to manage images on this project!</div>
</template>



<style scoped>
.title {
    font-size: 1.5em;
    color: #333;
}

.image-component {
    max-width: 100%;
    margin: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}



.upload-section,
.url-section {
    margin-bottom: 20px;
}

.upload-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.file-input {
    margin-bottom: 10px;
}

.upload-button {
    color: #fff;
    background-image: linear-gradient(145deg, #6a11cb, #2575fc);
    margin-top: 4px;
    height: 2rem;
    border-radius: 0.375rem;
}

.upload-button:hover {
    background-color: #0056b3;
}

.upload-message {
    font-size: 0.9em;
    margin-top: 10px;
}

.upload-message.error {
    color: #dc3545;
}

.upload-message.success {
    color: #28a745;
}

.preview-img {
    margin-top: 20px;
    max-width: 100%;
    border-radius: 8px;
}



.success-message {
    color: #28a745;
    font-size: 0.9em;
    margin-top: 10px;
}

.error-message {
    color: #dc3545;
    font-size: 0.9em;
    margin-top: 10px;
}

.not-logged-in {
    text-align: center;
    font-size: 1.2em;
    color: #6c757d;
}
</style>
