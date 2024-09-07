import express from 'express';
import morgan from 'morgan';

import postsRoutes from './routes/posts.routes.js';

const app = express();

// middlewares
app.use(morgan('dev'));
app.use(express.json());

//Routes
app.get('/', (req, res) => {
    res.json({
        message: 'https://github.com/KingNawl/API-Plataforma-Blogs'
    });
})

app.use('/posts', postsRoutes);

export default app;