import mongoose from 'mongoose';
import { MovieRepository } from './repositories/MovieRepository.js';
import { IMovie } from './models/Movie.js';

const MONGO_URI = 'mongodb://localhost:27017/movierec'; // adjust if needed

const movies: Partial<IMovie>[] = [
    {
        title: "Megamozg",
        description: "A thrilling Kazakh sci-fi movie.",
        genres: ["Sci-Fi", "Action"],
        director: "Director A",
        cast: ["Actor 1", "Actor 2"],
        releaseYear: 2022,
        duration: 120,
        rating: 8.2,
        price: 5.99,
        posterUrl: "",
        trailerUrl: ""
    },
    {
        title: "Shal",
        description: "A touching drama about family and life.",
        genres: ["Drama"],
        director: "Director B",
        cast: ["Actor 3", "Actor 4"],
        releaseYear: 2021,
        duration: 110,
        rating: 7.8,
        price: 4.99
    },
    {
        title: "Otyzdan Asyp Baramyn",
        description: "An inspiring journey across Kazakhstan.",
        genres: ["Adventure", "Drama"],
        director: "Director C",
        cast: ["Actor 5", "Actor 6"],
        releaseYear: 2020,
        duration: 130,
        rating: 8.5,
        price: 6.99
    },
    {
        title: "The Wolf of Wall Street",
        description: "The story of a stockbroker's rise and fall.",
        genres: ["Biography", "Comedy", "Crime"],
        director: "Martin Scorsese",
        cast: ["Leonardo DiCaprio", "Jonah Hill"],
        releaseYear: 2013,
        duration: 180,
        rating: 8.2,
        price: 9.99
    },
    {
        title: "Titanic",
        description: "A love story on the doomed ship Titanic.",
        genres: ["Romance", "Drama"],
        director: "James Cameron",
        cast: ["Leonardo DiCaprio", "Kate Winslet"],
        releaseYear: 1997,
        duration: 195,
        rating: 7.9,
        price: 8.99
    },
    {
        title: "Joker",
        description: "The origin story of the infamous Batman villain.",
        genres: ["Crime", "Drama", "Thriller"],
        director: "Todd Phillips",
        cast: ["Joaquin Phoenix", "Robert De Niro"],
        releaseYear: 2019,
        duration: 122,
        rating: 8.5,
        price: 7.99
    },
    {
        title: "The Dictator",
        description: "A comedy about a tyrannical dictator.",
        genres: ["Comedy"],
        director: "Larry Charles",
        cast: ["Sacha Baron Cohen"],
        releaseYear: 2012,
        duration: 83,
        rating: 6.4,
        price: 5.99
    },
    {
        title: "The Last King of Scotland",
        description: "A dramatic story about Idi Amin's regime in Uganda.",
        genres: ["Drama", "History", "Thriller"],
        director: "Kevin Macdonald",
        cast: ["Forest Whitaker", "James McAvoy"],
        releaseYear: 2006,
        duration: 143,
        rating: 7.7,
        price: 6.99
    },
    {
        title: "Inception",
        description: "A mind-bending thriller about dreams within dreams.",
        genres: ["Action", "Sci-Fi", "Thriller"],
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
        releaseYear: 2010,
        duration: 148,
        rating: 8.8,
        price: 9.99
    },
    {
        title: "Interstellar",
        description: "An epic journey through space to save humanity.",
        genres: ["Adventure", "Drama", "Sci-Fi"],
        director: "Christopher Nolan",
        cast: ["Matthew McConaughey", "Anne Hathaway"],
        releaseYear: 2014,
        duration: 169,
        rating: 8.6,
        price: 9.99
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const repo = new MovieRepository();

        for (const m of movies) {
            const exists = await repo.findOne({ title: m.title });
            if (!exists) {
                await repo.create(m);
                console.log(`Added movie: ${m.title}`);
            } else {
                console.log(`Movie already exists: ${m.title}`);
            }
        }

        console.log('Seeding complete');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
