import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { Link, useHistory } from 'react-router-dom';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';

import Dropzone from '../../components/Dropzone';

import api, { ibge } from '../../services/api';

import { FiArrowLeft } from 'react-icons/fi';

import logoImg from '../../assets/logo.svg';

import './styles.css';

interface ItemProps {
    id: number,
    title: string,
    image_url: string
}

interface IbgeUfPropsResponse {
    sigla: string
}
interface IbgeCityPropsResponse {
    nome: string
}

const CreatePoint = () => {

    const history = useHistory();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [items, setItems] = useState<ItemProps[]>([]);

    const [ibgeUfs, setIbgeUfs] = useState<string[]>([]);
    const [ibgeCities, setIbgeCities] = useState<string[]>([]);

    const [selectedFile, setSelectedFile] = useState<File>();

    const [selectedUf, setSelectedUf] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([
                latitude,
                longitude
            ]);

            setSelectedPosition([
                latitude,
                longitude
            ]);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        ibge.get<IbgeUfPropsResponse[]>('estados').then(response => {
            const ibgeUfsInitials = response.data.map(uf => uf.sigla);
            setIbgeUfs(ibgeUfsInitials);
        });
    }, []);

    useEffect(() => {

        if (selectedUf) {
            ibge.get<IbgeCityPropsResponse[]>(`estados/${selectedUf}/municipios`).then(response => {
                const ibgeCityNames = response.data.map(city => city.nome);
                setIbgeCities(ibgeCityNames);
            })
        } else
            setIbgeCities([]);

    }, [selectedUf]);


    function handlerClickMap(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handlerChangeInput(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    function handlerSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value);
    }

    function handlerSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handlerSelectedItem(id: number) {

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {

            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);

        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handlerSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const [latitude, longitude] = selectedPosition;
        const uf = selectedUf;
        const city = selectedCity;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('uf', uf);
        data.append('city', city);
        data.append('items', items.join(','));

        if (selectedFile)
            data.append('image', selectedFile);

        await api.post('points', data);

        history.push('/success');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logoImg} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handlerSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handlerChangeInput} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handlerChangeInput} />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handlerChangeInput} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={16.44} onClick={handlerClickMap}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handlerSelectedUf}>
                                <option value="">Selecione uma UF</option>
                                {
                                    ibgeUfs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handlerSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {
                                    ibgeCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => handlerSelectedItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.image_url} alt={item.title} />
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;