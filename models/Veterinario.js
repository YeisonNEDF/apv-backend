import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import generarId from '../helpers/generarId.js';

const veterinarioSchema = mongoose.Schema({
    nombre:{
        type:String,
        require: true,
        trim: true
    },
    password:{
        type: String,
        require: true
    },
    email:{
        type:String,
        require: true,
        unique: true,
        trim : true
    },
    telefono:{
        type: String,
        default: null,
        trim: true
    },
    web:{
        type: String,
        default: null
    },
    token:{
        type: String,
        default: generarId(),
    },
    confirmado:{
        type: Boolean,
        default:false,
    }
});

//Antes de almacenar en la BD encriptamos el password
veterinarioSchema.pre("save", async function(next){
    //Si ya esta encriptado el password, no se encripta denuevo en una actualización/Modificación 
    if(!this.isModified("password")){
        next();
    }   
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


//Comparamos usuario enviado por el usuario con el encriptado
veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Veterinario = mongoose.model('Veterinario', veterinarioSchema);
export default Veterinario;