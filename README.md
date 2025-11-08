# Movie Recommendation System
### Node.js + Fastify + MongoDB (Redis for Caching) -API for Movie Recommendation System
### SvelteKit + Tailwind CSS + Lucid - Frontend for Movie Recommendation System

## Auth:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/preferences

## Movies:
GET    /api/movies
GET    /api/movies/:id
GET    /api/movies/search?q=...
GET    /api/movies/genre/:genre
POST   /api/movies (admin)
PUT    /api/movies/:id (admin)
DELETE /api/movies/:id (admin)

## Interactions:
POST   /api/interactions
GET    /api/interactions
DELETE /api/interactions/:movieId/:type
GET    /api/watchlist
GET    /api/purchases

## Recommendations:
GET    /api/recommendations?strategy=hybrid&limit=10
GET    /api/recommendations/similar/:movieId


## Features
✅ Backend (TypeScript + Fastify)
✅ MongoDB models
✅ Redis caching
✅ REST API
✅ Authentication (JWT)
✅ Recommendation algorithms
✅ Design patterns

✅ Frontend (SvelteKit + TailwindCSS v4)
✅ User authentication
✅ Movie catalog
✅ Search & filters
✅ Recommendations
✅ Admin panel
✅ Responsive UI

✅ Infrastructure
✅ Docker Compose
✅ MongoDB container
✅ Redis container