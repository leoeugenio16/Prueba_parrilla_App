"use client";
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import ProtectedPage from '../components/ProtectedPage';

const AgregarProducto = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [tipo, setTipo] = useState('COMIDAS');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carga
    /* const [bgImage, setBgImage] = useState(""); */
    const router = useRouter();
    const nombresPermitidos = ['celeste', 'otroNombre', 'otroNombreMas']; // Agrega los nombres que permites
    const checkAuth = () => {
        const token = localStorage.getItem('jwt');
        const usuario = localStorage.getItem('usuario');

        /* console.log('Token:', token);
        console.log('Usuario:', usuario); */

        if (!token || !usuario) {
            console.log('No autenticado');
            router.push('/login');
            return false;
        }

        try {
            const parsedUser = JSON.parse(usuario);

            /* console.log('ParsedUser:', parsedUser); */

            if (!nombresPermitidos.includes(parsedUser.username.toLowerCase())) {
                /* console.log('No autorizado'); */
                alert('Usuario sin permiso. Por favor, ingrese datos del usuario autorizado.');
                router.push('/login');
                return false;
            }

            /* console.log('Autenticado y autorizado'); */
            return true;
        } catch (error) {
            console.error('Error:', error);
            router.push('/login');
            return false;
        }
    };
    const tipos = [
        "COMIDAS",
        "AGUAS Y GASEOSAS",
        "ESPIRITUOSAS Y APERITIVOS",
        "VINOTECA CLASICA",
        "BODEGA CONO SUR",
        "BODEGA TRIVENTO",
        "BODEGA NORTON",
        "BODEGA EL ESTECO",
        "BODEGA MOSQUITA MUERTA",
        "BODEGA FINCA LAS MORAS",
        "BODEGA LA CELIA",
        "CERVEZAS",
        "VINOS ESPUMANTES",
        "SIDRAS",
        "CAFETERÍA"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar los campos antes de enviar
        if (!nombre || !descripcion || !precio || !cantidad) {
            setError('Todos los campos son obligatorios');
            return;
        }

        const producto = {
            data: {
                nombre,
                Descripcion: descripcion,
                precio: precio.toString(),
                cantidad: parseInt(cantidad, 10),
                tipo,
            },
        };
        setLoading(true); // Habilitar el estado de carga
        try {
            // Hacer la solicitud POST a la API de Strapi
            await axios.post(
                `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos`,
                producto,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Si la creación es exitosa
            /* console.log('Producto creado:', response.data); */
            setSuccessMessage('Producto creado con éxito');

            // Limpiar los campos después de la creación exitosa
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setCantidad('');
            setTipo('COMIDAS');

            // Limpiar el error si fue creado correctamente
            setError('');
        } catch (error) {
            if (error instanceof Error) {
                // Si es una instancia de Error, accedemos a la propiedad `message`
                console.error('Error al crear el producto:', error.message);
            } else if (error instanceof AxiosError) {
                // Si es un error de Axios, accedemos a `response.data`
                console.error('Error al crear el producto:', error.response?.data || error.message);
            } else {
                // Si el error no es conocido, mostramos el error general
                console.error('Error desconocido:', error);
            }

            setError('Error al crear el producto. Verifique los datos.');
            setSuccessMessage(''); // Limpiar el mensaje de éxito si hubo error
        } finally {
            setLoading(false); // Desactivar el estado de carga después de la solicitud
        }
    };
    /* useEffect(() => {
        const newBgImage = window.innerWidth >= 1024 ? "/imagenPC.jpg" : "/imagenMobile.jpg";
        setBgImage(newBgImage);
    }, []); */

    return (
        <ProtectedPage checkAuth={checkAuth}>
            <div className="page-producto">
                <h1 className="title">
                    🛒 Agregar Producto
                </h1>

                {/* Mostrar errores o éxito */}
                {error && (
                    <div className="message message-error">
                        ❌ {error}
                    </div>
                )}
                {successMessage && (
                    <div className="message message-success">
                        ✅ {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-container">
                    <div>
                        <label className="form-label">📌 Nombre del Producto</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">📝 Descripción del Producto</label>
                        <input
                            type="text"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">💲 Precio del Producto</label>
                        <input
                            type="number"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">📦 Cantidad</label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">🔖 Tipo de Producto</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="form-select"
                            required
                        >
                            {tipos.map((tipoOption) => (
                                <option key={tipoOption} value={tipoOption}>
                                    {tipoOption}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={loading}
                    >
                        {loading ? "⏳ Creando..." : "✅ Crear Producto"}
                    </button>
                </form>
            </div>
        </ProtectedPage>
    );
    
};

export default AgregarProducto;
