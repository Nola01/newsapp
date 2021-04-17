// fichero js/controlador.js
/**
 * Biblioteca "casera" para hacer el "binding" del
 * os menús con las diferentes vistas de la APP.
 * Para usarla, basta con poner el mismo id a la entrada 
 * del menú que a su vista asociada, pero cambiando el prefijo, 
 * el el menú debe ser menu_AAA y en la vista panel_AAA.
 */
 $.controller = {};

 /**
  * Esta función gestiona qué panel está activo en cada momento (sólo puede
  * haber uno)
  * @param {type} panel_name el nombre del panel a activar
  */
 
 $.controller.activate = function (panel_name) {
     $($.controller.active_panel).hide("fast","swing");
     $(panel_name).show("fast","swing");
     $.controller.active_panel = panel_name;
 };
 
 /**
  * Función para crear todos los "onClick" de los menús y
  * asociarlos con cada panel correspondiente.
  */
 $.controller.active_panel = "";
 
 /**
  * Inicializa el controlador (lógica de la aplicación). 
  * Conecta los menús con la acción de mostrar el panel correspondiente.
  * Conecta los eventos de pulsar cada botón con la acción que 
  * debe llevar a cabo.
  * 
  * @param {*} panel_inicial 
  */
 $.controller.init = function (panel_inicial) {

    $.predefinidos.carga();
     
     console.log("Panel inicial="+panel_inicial);
 
     // Conectar los menús
     $('[id^="menu_"]').each(function () {
         var $this = $(this);
         var menu_id = $this.attr('id');
         var panel_id = menu_id.replace('menu_', 'caja_');
 
         $("#" + menu_id).click(function () {
             $.controller.activate("#" + panel_id);
         });
         // console.log("id_menu::" + menu_id + "  id_panel" + panel_id);
     });
     $("div.panel").hide();
     $(panel_inicial).show();
     $.controller.active_panel = panel_inicial;
 
     // Botón añadir canal
     $("#añadirCanal").click( function(){
         console.log( "Nombre canal: " + $("#nombreCanal").val() );
         console.log( "URL canal: "    + $("#urlCanal").val() );
         console.log( "Tipo canal: "   + $("#tipoCanal").val() );
         console.log( " ---======--- ");
         let canal = {
             nombre: $("#nombreCanal").val(),
             tipo: $("#tipoCanal").val(),
             url: $("#urlCanal").val()
         };
         $.marcadores.add(canal, $.controller.mensaje);
         
         $.controller.listChannels();
     });
 
     $("#cancelarCanal").click( function(){
         
         $.controller.listChannels();
     });
 
     // Pintar la lista de canales
     $("#menu_listar").click( function(){
         $.controller.listChannels();
     });
 
     // Lista de canales a borrar
     $("#menu_borrar").click( function(){
         $.marcadores.cargar();
         /*
         // Versión 1:
         // Procesar la lista de canales: $.marcadores.lista
         let html= "";
         // Bucle forEach:
         // canal: es un objeto de la lista
         // indes: es su posición en la lista 
         $.marcadores.lista.forEach( (canal, index) =>{
             html += "<option value='"+index+"'>"+
                 canal.nombre+"</option>";
         });
         $("#selectBorrar").empty();
         $("#selectBorrar").html(html);
         */
         /// VERSION ALTERNATIVA 2:
         $("#selectBorrar").empty();
         $.marcadores.lista.forEach( (canal, index) =>{
             $("#selectBorrar").append("<option value='"+index+"'>"+
                 canal.nombre+"</option>");
         });
         
 
     });
 
     // Pintar la lista de canales
     $("#botonBorrarAceptar").click( function(){
         $.marcadores.borrar($("#selectBorrar").val());
         $.controller.listChannels();
     });
     // Cancelar eliminar un canal, nos vuelve al inicio
     $("#botonBorrarCancelar").click( function(){
         $.controller.listChannels();
     });
 
 
     // Lista de canales a actualizar
     $("#menu_editar").click( function(){
         // Carga en el array "$.marcadores.lista" desde localStorage
         // los canales que hemos añadido
         $.marcadores.cargar();
         // empty() borra todos los hijos del nodo desde donde se llama
         $("#selectEditar").empty();
         // rellenamos el select con los valores de localStorage
         $.marcadores.lista.forEach( (canal, index) =>{
             // append añade un hijo (al final) al nodo desde donde se llama
             $("#selectEditar").append("<option value='"+index+"'>"+
                 canal.nombre+"</option>");
         });
         
     });
 
     // Cancelar actualizar un canal, nos vuelve al inicio
     $("#botonEditarCancelar").click( function(){
         $.controller.listChannels();
     });
 
     // Aceptar actualizar un canal
     $("#botonEditarAceptar").click( function(){
         let canal = $.marcadores.lista[$("#selectEditar").val()];
         $("#indexCanalEditar").val($("#selectEditar").val());
         $("#urlCanalEditar").val(canal.url);
         $("#nombreCanalEditar").val(canal.nombre);
         $("#tipoCanalEditar").val(canal.tipo);
         $.controller.activate("#caja_editar_form");
     });
 
     // Cancelar editar un canal, nos vuelve al inicio
     $("#cancelarCanalEditar").click( function(){
         $.controller.activate("#caja_editar");
     });
 
     // Actualizar el nombre del canal
     $("#añadirCanalEditar").click( function(){
         let index = parseInt($("#indexCanalEditar").val());
         let nuevoNombre = $("#nombreCanalEditar").val();
         $.marcadores.lista[index].nombre = nuevoNombre;
         $.marcadores.guardar();
         $.controller.listChannels();
     });

     // Actualiza la lista de predefinidos
     $("#menu_predefinidos").click( function(){
        let html= "<ol>";
         // Bucle forEach:
         // canal: es un objeto de la lista
         // indes: es su posición en la lista 
         $.predefinidos.lista.forEach( (canal, index) =>{
             html += "<li>"+
                 canal.nombre+"</li>";
         });
         html += "</ol>";
         $("#caja_predefinidos").html(html);
    });
 }
 
 /**
  * Con el Json de noticias saca la lista en la caja_noticias
  * @param {*} canal 
  */
 $.controller.detalleCanal = function(canal) {
     let  html = "";
     
     console.log(canal);
     if (canal.error !== undefined) {
         html += "<h4>Error</h4> <p>"+canal.error+".</p>";
     } else {
         html += "<ol>";
         canal.noticias.forEach( (noticia) => {
             html += "<li><a target='blank_' href='"+noticia.enlace+"'>"+
                 noticia.titulo+"</a></li>";
         });
         html += "</ol>";
     }
     $("#caja_noticias").html(html);
 }
 
 /**
  * Lista las noticias del canal iésimo
  * @param {*} index 
  */
 $.controller.listNews = function (index) {
     $.controller.activate("#caja_noticias");
     $.marcadores.leer(index, $.controller.detalleCanal);
 }
 
 /**
  * Lista los canales almacenados en el programa
  */
 $.controller.listChannels = function() {
         $.controller.activate("#caja_listar");
         $.marcadores.cargar();
         // Procesar la lista de canales: $.marcadores.lista
         let html= "<ol>";
         // Bucle forEach:
         // canal: es un objeto de la lista
         // indes: es su posición en la lista 
         $.marcadores.lista.forEach( (canal, index) =>{
             html += "<li onclick='$.controller.listNews("+index+")'>"+
                 canal.nombre+"</li>";
         });
         html += "</ol>";
         $("#caja_listar").html(html);
 }
 
 $.controller.mensaje = function(codigo, titulo, mensaje){
     switch (codigo) {
         case "ERROR":
             $("#mensajes").append(
                     '<div class="alert alert-danger" role="alert">'+
                     '<b>'+titulo+'</b>'+ mensaje +
                     '</div>');
             setTimeout(()=>{
                 $("#mensajes").empty();
             }, 4000);
             break;
         case "EXITO":
             $("#mensajes").append(
                 '<div class="alert alert-success" role="alert">'+
                 '<b>'+titulo+'</b>'+ mensaje +
                 '</div>');
             setTimeout(()=>{
                 $("#mensajes").empty();
             }, 4000);
             break;
         case "AVISO":
             $("#mensajes").append(
                 '<div class="alert alert-warning" role="alert">'+
                 '<b>'+titulo+'</b>'+ mensaje +
                 '</div>');
             setTimeout(()=>{
                 $("#mensajes").empty();
             }, 4000);
             break;
     }
 }
 