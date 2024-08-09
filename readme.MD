## DIY App: Share and Discover Crafting Projects

### Overview

The DIY App is a vibrant platform for craft enthusiasts to showcase their hand-crafted projects, whether it’s woodworking, knitting, or any other creative pursuit. The app provides users with the tools to create detailed project pages, complete with step-by-step instructions, images, and more. It fosters a community where users can connect, share, and discover new crafting ideas in an intuitive and engaging environment.

### Key Features

-   **Project Pages**: Users can create and manage detailed pages for their projects. Each project includes:

    -   **Title**: The name of the project.
    -   **Description**: A brief overview of the project.
    -   **Instructions**: Detailed, step-by-step guidance on how to complete the project.
    -   **Materials**: A list of materials needed.
    -   **Images**: Visuals to illustrate the project process and outcome.

-   **Project Categories**: Projects are organized into categories to facilitate easy searching and discovery. Categories are defined and assigned to projects, making it simple to find projects by type or theme.
-   **Comments and Ratings**: Users can interact with projects by:

    -   Leaving comments to provide feedback or ask questions.
    -   Rating projects to express their appreciation and help others find high-quality content.

-   **Search and Discover**: The app includes robust search and discovery features, allowing users to find projects based on keywords, categories, or popularity.

### Database Schema

The DIY App utilizes a comprehensive database schema to manage and organize data efficiently:

-   **Users**: Stores user information including email, name, username, and admin status.
-   **Projects**: Contains project details such as title, description, instructions, materials, and timestamps for creation and updates.
-   **Comments**: Captures user feedback on projects with timestamps and associations to projects and users.
-   **Ratings**: Records user ratings for projects.
-   **ProjectCategories**: Defines various categories for organizing projects.
-   **ProjectCategoryAssignments**: Associates projects with their respective categories.
-   **ProjectImages**: Stores images related to projects.

### Current Progress

The current development progress focuses solely on the backend functionality of the DIY App. This includes:

-   Database schema and structure
-   API endpoints for managing users, projects, comments, ratings, and images
-   Server-side logic and data handling

The frontend implementation and integration with the backend are forthcoming.

### Usage

To run both server and client simultaneously, use:

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
