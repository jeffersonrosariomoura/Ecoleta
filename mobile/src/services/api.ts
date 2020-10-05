import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.0.14:3333'
});

export const ibge = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades'
});

export default api;