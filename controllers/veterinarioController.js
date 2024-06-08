import Veterinario from "../models/Veterinario.js";
import generarJWT  from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req,res) => {
    const {email, password, nombre} = req.body;

    //Validar correo/Usuario repetido
    const existeUsuario = await Veterinario.findOne({email});
    //Retornamos mensaje si el usuario ya existe
    if(existeUsuario){
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg: error.message});
    }

    try {
        //Guardar un Nuevo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        //Enviar el amail
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        //Registrar Usuario
        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error);
    }

};

const perfil =  (req, res) => {
    const { veterinario} = req;
    res.json(veterinario);
};

const confirmar = async (req, res) => {
    const {token} = req.params;

    //Buscar usuario con el Token enviado
    const usuarioConfirmar = await Veterinario.findOne({token});

    if(!usuarioConfirmar){
        const error = new Error("Token no valido");
        return res.status(400).json({msg: error.message});
    }

    try {
        //Validar usuario y modificar info
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        //Guardar info
        await usuarioConfirmar.save();
        res.json({msg: "Usuario Confirmando Correctamente."}); 
    } catch (error) {
        console.log(error);
    }
    
};

const autenticar = async (req, res) => {
    const {email, password} = req.body;

    //Validar si existe para autenticarlo
    const usuario = await Veterinario.findOne({email});

    if(!usuario){
        const error = new Error("El Usuario no existe");
        return res.status(404).json({msg: error.message});
    }  
    
    //Comprobar si el usuario esta confirmado o no 
    if(!usuario.confirmado){
        const error = new Error("Tu Cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    } 
    //Revisar el password
    if(await usuario.comprobarPassword(password)){
    //Autenticar
    res.json({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        token: generarJWT(usuario.id),
    });
    }else{
    const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message});
}   
};

const olvidePassword = async (req, res) => {
    const {email} = req.body;

    const existeVeterinario = await Veterinario.findOne({email});
    if(!existeVeterinario){
        const error = new Error("El Usuario no existe");
        return res.status(400).json({msg: error.message});
    }

    try{
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        //Enviar Email con instrucciones para restaurar password
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token,
        });

        res.json({msg: "Hemos enviado un email con las instrucciones"})
    }catch(error){

    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;
    //Validamos que el token enviado si exista
    const tokenValido = await Veterinario.findOne({token});

    if(tokenValido){
        //el token es válido el usuario existe
        res.json({msg: "Token válido y el usuario existe"});
    }else{
        const error = new Error("token no válido");
        return res.status(400).json({msg: error.message});
    }
}

const nuevoPassword = async (req, res) => {
    //Revisamos el params(Parametro de la url)
    const {token} = req.params;
    //Revisamos lo que viene en el cuerpo
    const {password} = req.body;

    const veterinario = await Veterinario.findOne({token});
    if(!veterinario){
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message});
    }

    try {
        veterinario.token = null;
        //Resetiamos el password con el nuevopassword
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: "Password modificado correctamente."});
    } catch (error) {
        console.log(error);
    }
};

const actualizarPerfil = async (req, res) =>{
    const veterinario = await Veterinario.findById(req.params.id)
    if(!veterinario){
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message})
    }

    const {email} = req.body;
    if(veterinario.email !== req.body.email){
        const existeEmail = await Veterinario.findOne({email});
        if(existeEmail){
            const error = new Error("Ese email ya esta en uso");
            return res.status(400).json({msg: error.message})
        }
    }

    try {

        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;
        
        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);

    } catch (error) {
        console.log(error)
    }
}

const actualizarPassword = async (req, res) => {
    //Leer los datos
    const {id} = req.veterinario;
    const {passwordActual, nuevoPassword} = req.body;
    //Comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id)
    if(!veterinario){
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message})
    }
    //Comprobar su password
    if(await veterinario.comprobarPassword(passwordActual)){
        //Almacenar el nuevo password
        veterinario.password = nuevoPassword;
        await veterinario.save();
        res.json({msg: "Password Almacenado Correctamente"});
    }else{
        const error = new Error("El Password Actual es Incorrecto");
        return res.status(400).json({msg: error.message})
    }
    
}

export{
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
};