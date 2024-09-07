import app from './app.js';
import { PORT } from './config.js'

app.listen(PORT, () => {
    console.log(`Server inicializado en el puerto: ${PORT}`);
});