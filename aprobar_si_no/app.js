const express = require('express');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const open = require('open');
const glob = require('glob');
const path = require('path');

const app = express();
const PORT = 3000;

// Ruta del proyecto que quieres mover
const proyectoDir = './';

// Abrir la página en el navegador cuando inicies el servidor
app.get('/', (req, res) => {
    res.send('Servidor Live Preview activo.');
    open('http://localhost:3000');  // Aquí puedes cambiar la URL si es necesario
});

// Buscar todos los archivos index.html en el directorio del proyecto
const buscarIndexHtml = (dir) => {
    return new Promise((resolve, reject) => {
        glob(`${dir}/**/index.html`, (err, archivos) => {
            if (err) return reject(err);
            resolve(archivos);
        });
    });
};

// Cuando cierres el servidor, te hace la pregunta
const cerrarPreview = async () => {
    try {
        const archivosIndex = await buscarIndexHtml(proyectoDir);
        console.log('Archivos index.html encontrados:');
        archivosIndex.forEach((archivo, index) => {
            console.log(`${index + 1}: ${archivo}`);
        });

        inquirer.prompt([
            {
                type: 'confirm',
                name: 'gusto',
                message: '¿Te gustó el proyecto?',
                default: false
            }
        ]).then(answers => {
            const destino = answers.gusto ? '_aprobados' : '_descartados';
            fs.move(proyectoDir, destino)
                .then(() => console.log(`Proyecto movido a ${destino}.`))
                .catch(err => console.error(err));
            process.exit(); // Cerrar el proceso después de mover el archivo
        });

    } catch (err) {
        console.error('Error al buscar archivos index.html:', err);
        process.exit(1); // Salir con un código de error
    }
};

// Escuchar en el puerto y lanzar el preview
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Capturar el evento de cierre (Ctrl+C) para preguntar si te gustó el proyecto
process.on('SIGINT', cerrarPreview);
