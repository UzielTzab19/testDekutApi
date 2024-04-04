const express = require('express');
const mysql = require('mysql');

const app = express();

app.use(express.json());

const port = 3000;

const dbConfig = {
    host: 'b0nwabxvlk8afpde9tdx-mysql.services.clever-cloud.com',
    user: 'ufll0clwldbfbgjc',
    password:'l6HSto8WPIgoN1E1Wc6M',
    database:'b0nwabxvlk8afpde9tdx'
};


const dbConnection = mysql.createPool(dbConfig);

dbConnection.getConnection((error, connection)=>{
    if(error)
    {
        console.error(`Ocurrio un error al establecer la conexion con la base de datos: `,error);
    }
    else
    {
        console.log(`Conexion exitosa a la base de datos`);
        connection.release();

    }
});

app.get('/Juegos', (req, res)=>{
   dbConnection.query('SELECT * FROM Juegos', (error, results)=>{
        if(error)
        {
            console.error(`Ocurrio un error al obtener todos los juegos `,error);
        }
        else
        {
            console.log(`Juegos traidos exitosamente`);
            res.json(results);
        }
   })
});

app.get('/Usuarios',(req, res)=>
{
    dbConnection.query('SELECT * FROM Usuarios', (error, results)=>{
        if(error)
        {
            console.error(`Ocurrio un error en la consulta: `,error);
            res.status(500).json({message: "Error al obtener Usuarios de la tabla Usuarios"});
        }
        else
        {
            res.json(results);
        }
    });
});

app.get('/Usuario/:CorreoElectronico/:Contraseña',(req, res)=>{
    const {CorreoElectronico, Contraseña} = req.params;

        dbConfig.query('SELECT * FROM Usuarios WHERE CorreoElectronico = ? AND Contraseña = ?',[CorreoElectronico,Contraseña],(error, results)=>{
            if(error)
            {
                console.error('Ocurrio un error al obtner especificamente a un usuario');
                res.status(500).json({message:"Ocurrio un error al obtner especificamente a un usuario"});
            }
            else if(results.affectedRows === 0)
            {
                console.log("No se encontro el usuario deseado");
                res.status(404).json({message: "Usuario no encontrado"});
            }
            else
            {
                console.log("Usuario encontrado exitosamente");
                res.status(200).json(results);
            }
    });
});

app.post('/Usuario', (req, res)=>{
    console.log(req.body);
    const {Nombre, CorreoElectronico, Contraseña} = req.body;
    dbConnection.query('INSERT INTO Usuarios(Nombre, CorreoElectronico, Contraseña) VALUES (?,?,?)', [Nombre, CorreoElectronico, Contraseña],(error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al querer insertar un nuevo registro en la tabla Usuarios`, error);
            res.status(500).json({messge: "Occurio un error al querer insertar un registro en la tabla Usuarios"});
        }
        else
        {
            res.status(201).json({message: "Usuario registrado correctamente"});
            res.json(results);
        }
    });

});

app.post('/Juego', (req, res)=>
{
    const {Nombre, Descripcion, Precio, Genero} = req.body;
    dbConnection.query('INSERT INTO Juegos(Nombre, Descripcion, Precio, Genero) VALUE (?,?,?,?)', [Nombre, Descripcion, Precio, Genero ],(error, results)=>{
        if(error)
        {
            console.error(`Ocurrio un error al insertar un nuevo juego en tu tabla Juegos`);
            res.status(500).json({message: "Ocurio un error al inertar un nuevo registro a la tabla juegos"});

        }
        else
        {   
            console.log(`El juego fue insertado exitosamente`);
            res.json({message: "El juego fue insertado correctamente"});

        }

    });

});

app.delete('/EliminarUsuario', (req, res)=>{
    const {Id} = req.body;

    dbConnection.query('DELETE FROM Usuarios WHERE Id = ?', [Id], (error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al eliminar el registro`, error);
            res.status(500).json({message: "Error al eliminar al usuario"});
        }
        else if(results.affectedRows== 0)
        {
            console.log(`No se encontro ningun usuario con el id ${Id}`);
            res.status(404).json({message: "No se encontro ningun usuario"});
        }
        else
        {
            console.log("Usuario eliminado exitosamente");
            res.json({message:"Usuario eliminado exitosamente"});
        }
    });
});
app.delete('/EliminarJuego', (req, res)=>
{
    const {Id} = req.body;

    dbConnection.query('DELETE FROM Juegos WHERE Id = ?', [Id], (error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al querer eliminar un juego `,error);
            res.json({message: "Ocurrio un error al querer eliminar un juego "});
        }
        else if(results.affectedRows == 0)
        {
            console.log("El juego no fue encontrado");
            res.status(404).json({message: "El juego no fue encontrado con el id especificado"});
        }else
        {
            console.log("Juego eliminado exitosamente");
            res.json({message: "Juego eliminado exitosamente"});
        }

    });
});

app.delete('/EliminarJuego', (req, res)=>
{
    const {Id} = req.body;

    dbConnection.query('DELETE FROM Juegos WHERE Id = ?', [Id], (error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al querer eliminar un juego `,error);
            res.json({message: "Ocurrio un error al querer eliminar un juego "});
        }
        else if(results.affectedRows == 0)
        {
            console.log("El juego no fue encontrado");
            res.status(404).json({message: "El juego no fue encontrado con el id especificado"});
        }else
        {
            console.log("Juego eliminado exitosamente");
            res.json({message: "Juego eliminado exitosamente"});
        }

    });
});

app.put('/ActualizarUsuario/:Id',(req, res)=>
{
    const {Id} = req.params;
    const {Nombre, CorreoElectronico, Contraseña} = req.body;

    dbConnection.query('UPDATE Usuarios SET Nombre = ?, CorreoElectronico = ?, Contraseña = ? WHERE Id = ?',[Nombre, CorreoElectronico, Contraseña, Id],(error, results)=>{
        if(error)
        {
            console.error(`Occurrio un error al actualizar el usuario`, error);
            res.status(500).json({message: "Error al actualizar el usuario"});
        }
        else if(results.affectedRows == 0)
        {
            console.log(`El usuario con el id ${Id} no existe`);
            res.status(404).json({message: "El usuario no existe"});
        }
        else
        {
            console.log(`Usuario actualizado exitosamente`);
            res.json({message: "El usuario fue acrualizado exitosamente"});

        }
    });
});

app.put('/ActualizarJuego/:Id', (req, res)=>
{
    const {Id} = req.params; 
    const {Nombre, Descripcion, Precio, Genero}= req.body;

    dbConnection.query('UPDATE Juegos SET Nombre = ?, Descripcion = ?, Precio = ?, Genero = ? WHERE Id = ?',[Nombre,Descripcion, Precio, Genero, Id],(error, results)=>
    {

        if(error)
        {
            console.error(`Ocurrio un erro con la actualizacion de un juego`, error);
            res.status(500).json({message:"Ocurrio un erro con la actualizacion de un juego"});
        }
        else if(results.affectedRows == 0)
        {
            console.log(`No se encontro el juego con el Id: ${Id}`);
            res.status(404).json({message:"No se encontro el juego para actualizarlo"});
        }
        else
        {
            console.log("El juego fue actualizado exitosamente");
            res.json({message: "El juego fue actualizado exitosamente"});
        }
    });

});


app.listen(port, ()=>console.log(`Servidor lanzado en el puerto ${port}`));

