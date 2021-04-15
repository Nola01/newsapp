//Inicialización de componentes

/**
 * Código para hacer que se cierre sólo el menú al pulsar sobre él
 */
$('.navbar-nav li a').on('click', function(){
    if(!$( this ).hasClass('dropdown-toggle')){
        $('.navbar-collapse').collapse('hide');
    }
});

$.controller.init("caja_estructura");


