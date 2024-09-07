## DIY App: Share and Discover Crafting Projects

### Overview

Link to live application : https://diy-application.th0j9v66qkq0c.eu-central-1.cs.amazonlightsail.com/

The DIY App is a vibrant platform for craft enthusiasts to showcase their hand-crafted projects, whether it’s woodworking, knitting, or any other creative pursuit. The app provides users with the tools to create detailed project pages, complete with step-by-step instructions, images, and more. It fosters a community where users can connect, share, and discover new crafting ideas in an intuitive and engaging environment.

## Key Features

-   **Project Pages**: Users can create, update, and delete detailed pages for their projects. Each project includes:

    -   **Title**: The name of the project.
    -   **Description**: A brief overview of the project.
    -   **Instructions**: Detailed, step-by-step guidance on how to complete the project.
    -   **Materials**: A list of materials needed.
    -   **Images**: Visuals to illustrate the project process and outcome (images can be added or updated with links or files converted into URLs).

-   **Comments and Ratings**: Users can:

    -   Leave comments on projects (edit or delete comments).
    -   Rate projects to express appreciation and help others find high-quality content.

-   **Search and Discover**: Users can search for projects using keywords and navigate through pagination (6 projects per page).

-   **User Authentication**: Secure user sign-up, login, and authentication using tokens. Authentication ensures that only authorized users can create, update, or delete their own projects.

## Current Implementation

-   **Frontend**: Developed with Vue.js, providing a dynamic and responsive user interface.
-   **Backend**: Built with Node.js, utilizing tRPC for type-safe API interactions.
-   **Database**: Hosted on Neon, managing user data, projects, comments, ratings, and images.
-   **Containerization**: The application is containerized using Docker for consistent deployment.
-   **Cloud Hosting**: Deployed on AWS Lightsail for scalable cloud infrastructure.
-   **CDN**: Images are managed and delivered via UploadCare.
-   **Automation**: GitHub Actions handle automated testing, deployment workflows, and page publishing.

**Overall Application Functionality**:

-   Users can sign up, log in, create, update, and delete projects.
-   Add images to projects or update images using links or files converted into URLs.
-   Comment on projects, edit or delete comments.
-   Add ratings to other projects (not one's own).
-   Search for projects using a query on the home page and navigate with pagination (6 projects per page).
-   Projects are not editable by other users; authentication tokens are used to manage access.

## Future Ideas and Implementations

-   **Category Navigation**: Users will be able to select categories to view all projects associated with the selected category.
-   **Favorites System**: Users will be able to add and remove projects from their favorites.

### Database Schema

The DIY App utilizes a comprehensive database schema to manage and organize data efficiently:

-   **Users**: Stores user information including email, name, username, and admin status.
-   **Projects**: Contains project details such as title, description, instructions, materials, and timestamps for creation and updates.
-   **Comments**: Captures user feedback on projects with timestamps and associations to projects and users.
-   **Ratings**: Records user ratings for projects.
-   **ProjectImages**: Stores images related to projects.

### Usage

-   create **.env** with with data provided inside **.env.example**

#### Install packages and run migrations:

    npm install
    npm run migrate:latest

#### To run both server and client simultaneously, use:

    npm start

#### To run the server:

    cd server
    npm run dev

#### To run the client:

    cd client
    npm run client

#### To run tests:

    cd server
    npm run test

#### To use tRPC-panel:

    npm run dev

url : http://localhost:3000/api/v1/trpc-panel

1.  **Create a User**: Register a new user.
2.  **Login**: Authenticate to obtain a token.
3.  **Add Generated Token to Headers**:
    -   Key: `Authorization`
    -   Value: `Bearer <token>`
