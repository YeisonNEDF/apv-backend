import express from "express";
const router = express.Router();
import { 
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
} from '../controllers/veterinarioController.js'
import checkAuth from "../middleware/authMiddleware.js";    

//Llamado rest
//Área publica
router.post('/', registrar );
//Ruta con parametro dinamico
router.get("/confirmar/:token", confirmar);
router.post("/login", autenticar);
router.post("/olvide-password", olvidePassword);
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);
//Área privada
router.get('/perfil',checkAuth,perfil);
router.put('/perfil/:id',checkAuth, actualizarPerfil);
router.put('/actualizar-password',checkAuth, actualizarPassword);

export default router;