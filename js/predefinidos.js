$.predefinidos= {};

$.predefinidos.lista = {}

$.predefinidos.carga = function() {
    fetch("canales.json").
        then ( (response) => response.text()).
        then ( (texto) => $.predefinidos.lista=JSON.parse(texto)).
        catch( (error) => console.log("ERROR"));
};