export default class Validations {
    static title(tittle){
        if(!tittle){
            throw new Error('El titulo es requerido');
        }

        if(typeof tittle !== 'string'){
            throw new Error('El titulo debe ser un string');
        }

        if(tittle.length > 50){
            throw new Error('El titulo no debe superar los 50 caracteres');
        }
    }

    static content(content){
        if(!content){
            throw new Error('El contenido es requerido');
        }

        if(typeof content !== 'string'){
            throw new Error('El contenido debe ser un string');
        }

        if(content.length > 500){
            throw new Error('El contenido no debe superar los 500 caracteres');
        }
    }

    static category(category){
        if(!category){
            throw new Error('La categoria es requerida');
        }

        if(typeof category !== 'string'){
            throw new Error('La categoria debe ser un string');
        }

        if(category.length > 25){
            throw new Error('La categoria no debe superar los 20 caracteres');
        }
    }

    static tags(tags){
        if(!tags){
            throw new Error('Los tags son requeridos');
        }

        if(!Array.isArray(tags)){
            throw new Error('Los tags deben ser enviados en un arreglo');
        }

        if(!tags.length){
            throw new Error('Debe enviar al menos un tag');
        }

        tags.forEach(tag => {
            if(typeof tag !== 'string'){
                throw new Error('Los tags deben ser strings');
            }

            if(tag.length > 25){
                throw new Error('Los tags no deben superar los 20 caracteres');
            }
        })
    }
}