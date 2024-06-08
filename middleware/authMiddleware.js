import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";


const checkAuth = async (req, res, next) =>{
    let token;
    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
     try {
        //Cortamos la palabra bearer y el espacio y traemos solo el token 
        token = req.headers.authorization.split(' ')[1]
        //Validamos el token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //traemos el id y obmitimos los que no queremos que se muestren con el -
        req.veterinario = await Veterinario.findById(decoded.id).select(
            "-password -token -confirmado"
        );
        return next();
     } catch (error) {
        const e = new Error("Token no Válido");
        return res.status(403).json({msg: e.message});
     }
    }

    if(!token){
        const error = new Error("Token no Válido con bearer");
        res.status(403).json({msg: error.message});
    }
    next();
   
};

export default checkAuth;