import React, { useEffect, useState } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { RectButton } from 'react-native-gesture-handler';
import { Text, View, Image, ImageBackground, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { ibge } from '../../services/api';

import { Feather as Icon } from '@expo/vector-icons';

import logoImg from '../../assets/logo.png';
import homeBackgroundImg from '../../assets/home-background.png';

interface RNPickerSelectProps {
    label: string,
    value: string
}

interface IbgeUfPropsResponse {
    sigla: string
}

interface IbgeCityPropsResponse {
    nome: string
}

const Home = () => {

    const navigation = useNavigation();

    const [uf, setUf] = useState('');
    const [city, setCity] = useState('');

    const [ibgeUfs, setIbgeUfs] = useState<string[]>([]);
    const [ibgeCities, setIbgeCities] = useState<string[]>([]);

    useEffect(() => {
        ibge.get<IbgeUfPropsResponse[]>('estados').then(response => {
            const ibgeUfsInitials = response.data.map(uf => uf.sigla);
            setIbgeUfs(ibgeUfsInitials);
        });
    }, []);

    useEffect(() => {
        if (uf) {
            ibge.get<IbgeCityPropsResponse[]>(`estados/${uf}/municipios`).then(response => {
                const ibgeCityNames = response.data.map(city => city.nome);
                setIbgeCities(ibgeCityNames);
            })
        } else
            setIbgeCities([]);
    }, [uf]);

    function handlerSelectedUf(value: string) {
        setUf(value);
    }

    function handlerSelectedCity(value: string) {
        setCity(value);
    }

    function handleNavigationToPoints() {
        navigation.navigate('Points', {
            uf,
            city
        });
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ImageBackground source={homeBackgroundImg} style={styles.container} imageStyle={{ width: 274, height: 368 }}>
                <View style={styles.main}>
                    <Image source={logoImg} />
                    <View>
                        <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
                        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta eficiente.</Text>
                    </View>
                </View>

                <View style={styles.footer}>

                    <RNPickerSelect
                        style={{
                            inputIOS: styles.select,
                            placeholder: {
                                color: '#6C6C80',
                            },
                            inputAndroid: styles.select,
                        }}
                        placeholder={{ label: 'Selecione uma UF', value: '' }}
                        onValueChange={(value) => handlerSelectedUf(value)}
                        items={
                            ibgeUfs.map(item => {
                                return { label: item, value: item }
                            })
                        }
                    />

                    <RNPickerSelect
                        style={{
                            inputIOS: styles.select,
                            placeholder: {
                                color: '#6C6C80',
                            },
                            inputAndroid: styles.select,
                        }}
                        placeholder={{ label: 'Selecione uma cidade', value: '' }}
                        onValueChange={(value) => handlerSelectedCity(value)}
                        items={
                            ibgeCities.map(item => {
                                return { label: item, value: item }
                            })
                        }
                    />

                    {/* <TextInput
                        style={styles.input}
                        placeholder="Digite a UF"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={2}
                        value={uf}
                        onChangeText={setUf} />

                    <TextInput
                        style={styles.input}
                        placeholder="Digite a Cidade"
                        autoCorrect={false}
                        value={city}
                        onChangeText={setCity} /> */}

                    <RectButton style={styles.button} onPress={handleNavigationToPoints}>
                        <View style={styles.buttonIcon}>
                            <Icon name="arrow-right" color="#FFF" size={24} />
                        </View>
                        <Text style={styles.buttonText}>
                            Entrar
                    </Text>
                    </RectButton>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {
        height: 60,
        color: '#a9a9a9',
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});

export default Home;