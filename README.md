# Property Management System

## Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Git](https://git-scm.com/downloads)

## Getting Started

1. **Clone or Pull the Repository**
   ```bash
   git pull origin feature/properties-implementation
   ```

2. **Run with Docker**
   
   Run the following command to start all services (Backend, Database, Admin Dashboard, Tenant Portal). This command includes the necessary environment variables for Google Authentication and API connectivity.

   ```bash
   VITE_GOOGLE_CLIENT_ID=148696767812-0m22i59jnp90ejdr9gp6itg52svthbqg.apps.googleusercontent.com \
   VITE_GOOGLE_API_KEY=AIzaSyC5Qlk2TV3JGc8IbWp8NjGjda_BQ24uNBg \
   VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id-here \
   docker compose up -d --build
   ```

   *Note: The `VITE_` variables are build-time arguments for the frontend containers.*

3. **Access the Application**

   - **Admin Dashboard**: [http://localhost:5173](http://localhost:5173)
   - **Tenant Portal**: [http://localhost:5174](http://localhost:5174)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)
   - **Database**: Port 5433

## Troubleshooting

- **Port Conflicts**: Ensure ports `3000`, `5173`, `5174`, and `5433` are free on your machine. Stop any local `npm run dev` or postgres instances.
- **Backend Crash**: If the backend exits immediately, check logs with `docker logs property_mgmt_backend`.
- **Database Persistence**: Data is stored in the `db_data` Docker volume.
