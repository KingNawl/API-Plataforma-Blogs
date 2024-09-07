import {
    Router
} from 'express';
import connectDB from '../db.js';
import Validations from '../helpers/validations.js';

const router = Router();

router.post('/', async (req, res) => {
    const { title, content, category, tags } = req.body;
    let connection;

    try {

        Validations.title(title);
        Validations.content(content);
        Validations.category(category);
        Validations.tags(tags);

        // Iniciar la conexión a la base de datos
        connection = await connectDB();

        // Iniciar la transacción
        await connection.beginTransaction();

        // Insertar el post
        let query = 'INSERT INTO posts (title, content, category) VALUES (?, ?, ?)';
        const [result] = await connection.query(query, [title, content, category]);
        const postId = result.insertId;

        // Procesar los tags
        for (const tag of tags) {
            // Comprobamos si existe el tag
            query = 'SELECT * FROM tags WHERE name = ?';
            const [infoTag] = await connection.query(query, [tag]);

            let tagId;
            if (infoTag.length) {
                tagId = infoTag[0].id;
            } else {
                query = 'INSERT INTO tags (name) VALUES (?)';
                const [insertTag] = await connection.query(query, [tag]);
                tagId = insertTag.insertId;
            }

            query = 'INSERT INTO posts_tags (idPosts, idTags) VALUES (?, ?)';
            await connection.query(query, [postId, tagId]);
        }

        // Confirmar la transacción
        await connection.commit();

        // Obtener el post insertado
        query = 'SELECT * FROM posts WHERE id = ?';
        const [post] = await connection.query(query, [postId]);

        res.status(201).json({
            ...post[0],
            tags
        });
    } catch (error) {
        // Revertir la transacción
        await connection.rollback();
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud', error });
    }/*  finally {
        // Cerrar la conexión solo si está abierta
        if (connection && connection.end) {
            await connection.end();
        }
    } */
});

export default router;