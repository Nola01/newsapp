/**
 * El objeto marcadores gestiona los canales que vamos a guardar en
 * LocalStorage.
 */
 $.marcadores = {};

 /**
  * Este array contiene los marcadores o canales RSS/Atom con 
  * la siguiente estructura de cada elemento:
  * canal = {
  *      nombre: 'Nombre del Canal',
  *      tipo: ['ATOM'|'RSS'],
  *      url: 'https://abcd.com'
  *  }
  */
 $.marcadores.lista = [];
 
 /**
  * Carga en el array $.marcadores.lista la lista de marcadores
  * desde LocalStorage. Hace el unmarshalling del JSON (parse).
  * Devuelve el array vacío si no había marcadores almacenados o
  * el JSON está corrupto.
  */
 $.marcadores.cargar = function () {
     // Si el navegador es compatible con LocaStorage, leemos la clave "canales"
     // y el texto asociado, lo parseamos y convertimos a objeto JSON
     if (typeof(Storage) !== "undefined") {
         if (localStorage.getItem("canales") !== null) {
             $.marcadores.lista = JSON.parse(
                 localStorage.getItem("canales"));
         }
     } else {
         // ERROR localstorage no soportado
     }
 }
 
 /**
  * Guarda los canales del array en LocalStorage para poder usarlos
  * de una ejecución del programa a otra.
  */
 $.marcadores.guardar = function() {
     // Si el navegador es compatible con almacenamiento de sesión o local, 
     // guardamos el objeto en almacenamiento local.
     if (typeof(Storage) !== "undefined") {
         localStorage.setItem(
             "canales", 
             JSON.stringify($.marcadores.lista));
     } else {
         //ERROR LocalStorage no está soportado!!!
     }
 }
 
 /**
  * Elimina del array el elemento i-ésimo (index).
  * Además llama a guardar para almacenar los cambios.
  * Comprueba que esa posición esté dentro del rango posible.
  * @param {*} index la posición del elemento a borrar
  */
 $.marcadores.borrar = function(index) {
     $.marcadores.lista.splice(index,1);
     $.marcadores.guardar();
 }
 
 /**
  * Devuelve las noticias del elemento i-ésimo (la posición dada por "index").
  * Comprueba que esa posición esté dentro del rango posible.
  * canal = {
  *      nombre: 'Nombre del Canal',
  *      tipo: ['ATOM'|'RSS'],
  *      url: 'https://abcd.com'
  *  }
  * @param {*} 
  *  index la posición del elemento a leer
  *  fnCallBack función a la que llamar cuando obtengamos las noticias
  */
 $.marcadores.leer = function(index, fnCallBack) {
     if (index >=0 && index < $.marcadores.lista.length ) {
         let canal = $.marcadores.lista[index];
         let json = {};
         fetch(canal.url, { mode: 'cors' }).
             then( (response) => response.text() ).
             then( (str) => new window.DOMParser().parseFromString(str, "text/xml")).
             then( (documento) => {
                 //console.log(documento);
                 if (canal.tipo === "ATOM") {
                     json = $.marcadores.procesaAtom(documento);
                 } else { 
                     if (canal.tipo === "RSS") {
                         json = $.marcadores.procesaRss(documento);
                     } else {
                         json = {"error": "tipo de canal desconocido"};
                     }
                 }
                 fnCallBack(json);
             });
     } else {
         fnCallBack({error: 'Index out of bounds'})
     }
 }
 
 /**
  * Actualiza el canal que esté en la posición "index" (i-esima)
  * con los datos del nuevo "canal" que se pasa como parámetro con esta
  * estructura.
  *  canal = {
  *      nombre: 'Nombre del Canal',
  *      tipo: ['ATOM'|'RSS'],
  *      url: 'https://abcd.com'
  *  }
  * @param {*} index 
  * @param {*} canal 
  */
 $.marcadores.actualizar = function(index, canal){
     $.marcadores.lista[index].canal.nombre = canal.nombre;
     // $.marcadores.lista[index].canal.tipo = canal.tipo;
     // $.marcadores.lista[index].canal.url = canal.url;
     $.marcadores.guardar();
 }
 
 /**
  * Añade un marcador
  * canal = {
  *      nombre: 'Nombre del Canal',
  *      tipo: ['ATOM'|'RSS'],
  *      url: 'https://abcd.com'
  *  }
  * @param {*} marcador El canal de noticias a añadir
  */
  $.marcadores.add = function(marcador, fn_callback) {
     $.marcadores.query(marcador, fn_callback);
 }
 
 /**
  * Este método consulta un canal de noticias y devuelve 
  * las noticias 
  * @param {*} 
  * canal = {
  *      nombre: 'Nombre del Canal',
  *      tipo: ['ATOM'|'RSS'],
  *      url: 'https://abcd.com'
  *  }
  */
 $.marcadores.query = function(canal, fn_callback) {
     fetch(canal.url, { mode: 'cors' }).
     then( (response) => response.text() ).
     then((str) => new window.DOMParser().parseFromString(str, "text/xml")).
     then((documento) => {
         // Compruebo si es un canal RSS leyendo el nodo raíz (documentElement)
         if (documento.documentElement.tagName == 'rss') {
             canal.tipo = 'RSS';
             $.marcadores.lista.push(canal);
             $.marcadores.guardar();
             fn_callback("EXITO", "Correcto:", "Marcador Almacenado");
         } else {
             // Compruebo si es un canal ATOM leyendo el nodo raíz (documentElement)
             if (documento.documentElement.tagName == 'feed'){
                 canal.tipo = 'ATOM';
                 $.marcadores.lista.push(canal);
                 $.marcadores.guardar();
                 fn_callback("EXITO", "Correcto:", "Marcador Almacenado");
             } else {
                 // ERROR!!!!!
                 console.log("No reconozco este documento: "+documento.documentElement.tagName);
             }
 
         }
     }).catch((error)=>{
         console.log(error);
         fn_callback("ERROR", "Error de red:", "No ha sido posible conectar al canal");
     });
 }
 
 
 /**
  * Este método procesa un canal RSS y devuelve un array con las noticias.
  * canal = {
  *  titulo : "Título del canal",
  *  enlace: "URL a la página oficial del periódico",
  *  imagen: "foto",
  *  noticias : [
  *          {
  *              titulo: "Título de la noticia",
  *              fecha: "fecha de publicación",
  *              enlace: "URL a la noticia en el periódico",
  *              descripcion: "Breve descripción de la noticia"
  *          },
  *          {
  *              titulo: "Título de la noticia",
  *              fecha: "fecha de publicación",
  *              enlace: "URL a la noticia en el periódico",
  *              descripcion: "Breve descripción de la noticia"
  *          },
  *          {
  *              titulo: "Título de la noticia",
  *              fecha: "fecha de publicación",
  *              enlace: "URL a la noticia en el periódico",
  *              descripcion: "Breve descripción de la noticia"
  *          }
  *      ]
  * }
  * @param {*} documento 
  */
  $.marcadores.procesaRss =  function(documento){
      let canal = {};
      canal.noticias = [];
      // con jQuery queremos procesar el documento XML "documento"
      // find devuelve un array con los elementos que contienen esa etiqueta.
     $(documento).find("item").each((index, item) => {
         let noticia = {};
         console.log(index);
         noticia.titulo = $(item).find("title")[0].textContent;
         noticia.descripcion = $(item).find("description")[0].textContent;
         noticia.enlace = $(item).find("link")[0].textContent;
         noticia.fecha = $(item).find("pubDate")[0].textContent;
         canal.noticias.push(noticia);
     });
     return canal;
 }
 
 /**
 * @param {*} documento 
 */
 $.marcadores.procesaAtom =  function(documento){
     let canal = {};
     canal.noticias = [];
     // con jQuery queremos procesar el documento XML "documento"
     // find devuelve un array con los elementos que contienen esa etiqueta.
    $(documento).find("entry").each((index, item) => {
         let noticia = {};
         noticia.titulo = $(item).find("title")[0].textContent;
         noticia.descripcion = $(item).find("summary")[0].textContent;
         noticia.enlace = $(item).find("link")[0].getAttribute("href");
         noticia.fecha = $(item).find("updated")[0].textContent;
 
         canal.noticias.push(noticia);
    });
    return canal;
 }
 

