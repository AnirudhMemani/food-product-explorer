````js
# Food Product Explorer

## Project Overview

This application allows users to explore food products from the Open Food Facts database. Users can search for products, browse by categories, scan barcodes, and save their favorite products.

## Method Used to Solve the Problem

The Food Product Explorer was built using the following approach:

1. **Architecture**: Implemented a React application with TypeScript for type safety and better developer experience.

2. **State Management**: Used Redux Toolkit for global state management, with separate slices for products, favorites, and filters.

3. **API Integration**: Created a service layer to interact with the Open Food Facts API, handling data fetching, transformation, and error handling.

4. **UI Components**: Built a responsive UI using Tailwind CSS and shadcn/ui components, ensuring a consistent and accessible user experience.

5. **Features Implemented**:
   - Product search with pagination
   - Category-based browsing
   - Barcode scanning functionality
   - Detailed product view with nutritional information
   - Favorites management with local storage persistence
   - Advanced filtering and sorting options

6. **Performance Optimization**: Implemented debouncing for search, memoization for filtered products, and pagination to handle large datasets efficiently.

7. **Error Handling**: Added comprehensive error handling throughout the application with user-friendly error messages.

## Time Taken to Complete

Time taken to complete this assignment: 4 hours

## Running with Docker Compose

The easiest way to set up and run the project locally is using Docker Compose:

```bash
# Build and start the application
docker-compose up

# The application will be available at http://localhost:5173
````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js

```
