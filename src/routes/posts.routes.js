import {
    Router
} from "express";
import connectDB from "../db.js";
import Validations from "../helpers/validations.js";

const router = Router();

router.post("/", async (req, res) => {
    const {
        title,
        content,
        category,
        tags
    } = req.body;
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
        let query = "INSERT INTO posts (title, content, category) VALUES (?, ?, ?)";
        const [result] = await connection.query(query, [title, content, category]);
        const postId = result.insertId;

        insertTags(tags, connection, postId);

        // Confirmar la transacción
        await connection.commit();

        // Obtener el post insertado
        query = "SELECT * FROM posts WHERE id = ?";
        const [post] = await connection.query(query, [postId]);

        res.status(201).json({
            id: post[0].id,
            title: post[0].title,
            content: post[0].content,
            category: post[0].category,
            tags: tags,
            createdAt: post[0].createdAt,
            updatedAt: post[0].updatedAt
        });

    } catch (error) {
        // Revertir la transacción
        await connection.rollback();
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({
            error: "Error al procesar la solicitud",
            error,
        });
    }
});

router.put("/:idPost", async (req, res) => {
    const {
        idPost
    } = req.params;
    const {
        title,
        content,
        category,
        tags
    } = req.body;
    let connection;
    let query;

    try {
        Validations.title(title);
        Validations.content(content);
        Validations.category(category);
        Validations.tags(tags);

        connection = await connectDB();
        await connection.beginTransaction();

        //Modificar post
        query = "UPDATE posts set title = ?, content = ?, category = ? WHERE id = ?";
        await connection.query(query, [title, content, category, idPost]);

        //Modificar tags, como no sabemos el numero de tags que tiene cada post y si son los mismos que los anteriores, lo mejor es borrarlos todos y volver a insertarlos
        query = "DELETE FROM posts_tags WHERE idPosts = ?";
        await connection.query(query, [idPost]);

        insertTags(tags, connection, idPost);

        await connection.commit();

        // Obtener el post insertado
        query = "SELECT * FROM posts WHERE id = ?";
        const [post] = await connection.query(query, [idPost]);

        res.status(201).json({
            id: post[0].id,
            title: post[0].title,
            content: post[0].content,
            category: post[0].category,
            tags: tags,
            createdAt: post[0].createdAt,
            updatedAt: post[0].updatedAt
        })

    } catch (error) {
        // Revertir la transacción
        await connection.rollback();
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({
            error: "Error al procesar la solicitud",
            error,
        });
    }
});

router.delete("/:idPost", async (req, res) => {
    const {
        idPost
    } = req.params;
    let connection;

    try {
        connection = await connectDB();
        await connection.beginTransaction();

        //Borrar post
        let query = "DELETE FROM posts WHERE id = ?";
        await connection.query(query, [idPost]);

        await connection.commit();

        res.status(204).json();
    } catch (error) {
        // Revertir la transacción
        await connection.rollback();
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({
            error: "Error al procesar la solicitud",
            error,
        });
    }
});

router.get("/:idPost", async (req, res) => {
    const {
        idPost
    } = req.params;
    let connection;
    try {
        connection = await connectDB();
        const query = "SELECT posts.id, posts.title, posts.content, posts.category, tags.name as tag, posts.createdAt, posts.updatedAt FROM posts JOIN posts_tags ON posts.id = posts_tags.idPosts JOIN tags ON posts_tags.idTags = tags.id WHERE posts.id = ?";
        const [post] = await connection.query(query, [idPost]);

        if (!post.length) return res.status(404).json({
            error: "Post no encontrado"
        });

        return res.status(200).json({
            id: post[0].id,
            title: post[0].title,
            content: post[0].content,
            category: post[0].category,
            tags: post.map((p) => p.tag),
            createdAt: post[0].createdAt,
            updatedAt: post[0].updatedAt
        });
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        return res.status(500).json({
            error: "Error al procesar la solicitud",
            error,
        });
    }
})

router.get("/", async (req, res) => {

    const { term } = req.query;
    let connection;
    let query;
    let posts;
    try {
        connection = await connectDB();

        if (term) {
            query = "SELECT posts.id, posts.title, posts.content, posts.category, JSON_ARRAYAGG(tags.name) AS tags, posts.createdAt, posts.updatedAt FROM posts JOIN posts_tags ON posts.id = posts_tags.idPosts JOIN tags ON posts_tags.idTags = tags.id WHERE posts.title LIKE ? OR posts.content LIKE ? OR posts.category LIKE ? OR tags.name LIKE ? GROUP BY posts.id";
            [posts] = await connection.query(query, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
        }else{
            query = "SELECT posts.id, posts.title, posts.content, posts.category, JSON_ARRAYAGG(tags.name) AS tags, posts.createdAt, posts.updatedAt FROM posts JOIN posts_tags ON posts.id = posts_tags.idPosts JOIN tags ON posts_tags.idTags = tags.id GROUP BY posts.id ";
            [posts] = await connection.query(query);
        }
        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        return res.status(500).json({
            error: "Error al procesar la solicitud",
            error,
        });
    }
})

const insertTags = async (tags, connection, postId) => {

    let query;

    // Procesar los tags
    for (const tag of tags) {
        // Comprobamos si existe el tag
        query = "SELECT * FROM tags WHERE name = ?";
        const [infoTag] = await connection.query(query, [tag]);

        let tagId;
        if (infoTag.length) {
            tagId = infoTag[0].id;
        } else {
            query = "INSERT INTO tags (name) VALUES (?)";
            const [insertTag] = await connection.query(query, [tag]);
            tagId = insertTag.insertId;
        }

        query = "INSERT INTO posts_tags (idPosts, idTags) VALUES (?, ?)";
        await connection.query(query, [postId, tagId]);
    }
}

export default router;