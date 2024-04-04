const { error } = require('console');
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json());

const dbConfig = {
    host:"b0nwabxvlk8afpde9tdx-mysql.services.clever-cloud.com",
    user: "ufll0clwldbfbgjc",
    password:"l6HSto8WPIgoN1E1Wc6M",
    database:"b0nwabxvlk8afpde9tdx"
};

const dbConnection = mysql.createPool(dbConfig);

dbConnection.getConnection((error, connection)=>{
    if(error)
    {
        console.error(`A ocurrido un error al intentar conectar con la base de datos`, error);
    }
    else
    {
        console.log("Conexion exitosa a la base de datos");
        connection.release();
    }
});

app.get('/Users',(req, res)=>
{
    dbConnection.query('SELECT * FROM Usuarios',(error,results)=>
    {
        if(error)
        {
            console.error(`A ocurrido un error al traer todos los usuarios`, error);
            res.status(500).json({message: "A ocurrido un error al traer todos los usuarios"});
        }
        else
        {
            console.log("Obtencion de usuarios exitosa");
            res.json(results);
        }
    });
});

app.post('/InsertUser', (req, res)=>{
    const {Nombre, CorreoElectronico, Contraseña}= req.body;
    dbConnection.query('INSERT INTO Usuarios (Nombre, CorreoElectronico, Contraseña)VALUES(?,?,?)', [Nombre, CorreoElectronico, Contraseña], (error, results)=>
    {
        if(error)
        {
            console.error(`A ocurrido un error al insertar un nuevo registro`, error);
            res.status(500).json({message: "A ocurrido un error al insertar un nuevo registro"});
        }
        else
        {
            console.log(`Se ha insertado el nuevo registro con exito`);
            res.json({message: "Se ha insertado el nuevo registro con exito"});

        }
    });
});

app.delete('/deleteUser/:Id', (req, res)=>{
    const {Id} = req.params;
    const {CorreoElectronico, Contraseña} = req.body;

    let idUsuario;
    let nombreUsuario;
    let correoElectronico;
    let contraseña;

    dbConnection.query('SELECT Nombre FROM Usuarios WHERE Id = ? AND CorreoElectronico = ? AND Contraseña = ?',[Id, CorreoElectronico,Contraseña],(error, results)=>
    {
        if(error)
        {
            console.error("Ocurrio un error al obtener al usuario");
        }
        else
        {
            console.log("Obtencion del usuario exitoso");
        }

    });

    dbConnection.query('DELETE FROM Usuarios WHERE Id = ? AND CorreoElectronico = ? AND Contraseña = ?', [Id,CorreoElectronico,Contraseña],(error, results)=>
    {
        if(error)
        {
            console.error(`A ocurrido un error al querer eliminar al usuario con el id ${Id}`);
            res.status(500).json({message: `A ocurrido un error al querer eliminar al usuario con el id ${Id}`});
        }
        else if(results.affectedRows == 0)
        {
            console.log("No se encontro el usario con el id especificado");
            
            
            res.status(404).json({message: "No se encontro al usuario con el id especificado"});
        }
        else
        {
            console.log("Se a eliminado el registro con exito");
            res.status(200).json({message:"Se a eliminado exitosamente el registro"});
        }
    });
});

app.put('/UpdateUser/:Id', (req, res) => {
    const { Id } = req.params;
    const { NombreNuevo, CorreoElectronicoNuevo, ContraseñaNueva, CorreoElectronico, Contraseña } = req.body;
  
    dbConnection.query('SELECT * FROM Usuarios WHERE Id = ?', [Id], (error, results) => {
      if (error) {
        console.error(`Ocurrió un error al verificar las credenciales`, error);
        res.status(500).json({ message: "Ocurrió un error al verificar las credenciales" });
      } else if (results.length === 0) {
        res.status(404).json({ message: "No se encontró al usuario con el id especificado" });
      } else if (results[0].CorreoElectronico !== CorreoElectronico || results[0].Contraseña !== Contraseña) {
        res.status(403).json({ message: "Las credenciales proporcionadas no coinciden con las actuales" });
      } else {
        dbConnection.query('UPDATE Usuarios SET Nombre = ?, CorreoElectronico = ?, Contraseña = ? WHERE Id = ?', [NombreNuevo, CorreoElectronicoNuevo, ContraseñaNueva, Id], (error, results) => {
          if (error) {
            console.error("Ocurrió un error al intentar actualizar un usuario", error);
            res.status(500).json({ message: "Ocurrió un error al intentar actualizar un usuario" });
          } else {
            console.log("Actualización realizada con éxito");
            res.status(200).json({ message: "Actualización realizada con éxito" });
          }
        });
      }
    });
  });




app.listen(port, ()=>console.log(`Servidor lanzado en el puerto ${port}`))