import React, { useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { FiCheckCircle } from 'react-icons/fi';

import './styles.css';

const Success = () => {

    const history = useHistory();

    useEffect(() => {
        window.setTimeout(function () {
            history.push('/');
        }, 2000);
    });

    return (
        <div id="page-success">
            <div className="content">
                <main>
                    <FiCheckCircle />
                    <h1>Cadastro concluído!</h1>
                </main>
            </div>
        </div>
    )
}

export default Success;