
export const validateRut = (rut) => {
    if (!rut || typeof rut !== 'string') return false;

    // Limpiar el RUT
    const cleanRut = cleanRutString(rut);

    // Validar longitud mínima y formato básico
    if (cleanRut.length < 8 || !/^[0-9]+[0-9kK]{1}$/.test(cleanRut)) {
        return false;
    }

    // Separar cuerpo y dígito verificador
    const rutBody = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Calcular DV esperado
    const calculatedDv = calculateDv(rutBody);

    // Comparar con el DV ingresado
    return calculatedDv === dv;
};


export const calculateDv = (rutBody) => {
    let sum = 0;
    let multiplier = 2;

    // Iterar de derecha a izquierda
    for (let i = rutBody.length - 1; i >= 0; i--) {
        sum += parseInt(rutBody.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const calculatedDv = 11 - remainder;

    if (calculatedDv === 11) return '0';
    if (calculatedDv === 10) return 'K';
    return calculatedDv.toString();
};


export const formatRut = (rut) => {
    if (!rut) return '';

    // Limpiar el RUT
    const cleanRut = cleanRutString(rut);

    if (cleanRut.length <= 1) return cleanRut;

    // Separar cuerpo y DV
    const rutBody = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Formatear cuerpo con puntos
    let formattedBody = '';
    for (let i = rutBody.length - 1, j = 1; i >= 0; i--, j++) {
        formattedBody = rutBody.charAt(i) + formattedBody;
        if (j % 3 === 0 && i !== 0) formattedBody = '.' + formattedBody;
    }

    return `${formattedBody}-${dv}`;
};

/**
 * Limpia un string de RUT, dejando solo números y la K
 * @param {string} rut - RUT a limpiar
 * @returns {string} - RUT limpio (ej: "123456789")
 */
export const cleanRutString = (rut) => {
    return rut
        .replace(/\./g, '')
        .replace(/-/g, '')
        .replace(/ /g, '')
        .toUpperCase()
        .replace(/[^0-9K]/g, '');
};

export const getRutBody = (rut) => {
    const cleanRut = cleanRutString(rut);
    return cleanRut.slice(0, -1);
};

export const getDv = (rut) => {
    const cleanRut = cleanRutString(rut);
    return cleanRut.slice(-1).toUpperCase();
};


export const compareRuts = (rut1, rut2) => {
    return cleanRutString(rut1) === cleanRutString(rut2);
};

export default {
    validateRut,
    calculateDv,
    formatRut,
    cleanRutString,
    getRutBody,
    getDv,
    compareRuts
};