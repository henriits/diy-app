<template>
    <div>
        <h1>File Uploader</h1>
        <form @submit.prevent="uploadFile">
            <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" />
            <button type="submit">Upload file</button>
        </form>
        <p :class="messageClass">{{ message }}</p>
        <img v-if="previewSrc" :src="previewSrc" :alt="fileName" width="300" />
    </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';

// Define public key for Uploadcare
const UploadCareKey = import.meta.env.VITE_UPLOADCARE_PUB_KEY;
const pubkey = UploadCareKey;

// Define refs for handling file input and feedback messages
const fileInput = ref<HTMLInputElement | null>(null);
const previewSrc = ref<string | null>(null);
const message = ref<string>('');
const messageClass = ref<string>('');
const fileName = ref<string>('');
const uploadedFileUrl = ref<string | null>(null); // Ref to store the uploaded file URL

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
            uploadedFileUrl.value = fileUrl; // Store the URL in a ref
            console.log('Uploaded file URL:', fileUrl);
            console.log(uploadedFileUrl.value) // Use the URL as needed

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
</script>
