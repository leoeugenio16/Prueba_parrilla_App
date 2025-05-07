"use client";
import Producto from "@/types/productos";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { ArrowLeft, ArrowRight, SquareChevronRight } from "lucide-react";

const Menu = () => {
    const [productosPorTipo, setProductosPorTipo] = useState<Map<string, Producto[]>>(new Map());
    const [indiceTipo, setIndiceTipo] = useState<number>(-1); // Empezamos en -1 para mostrar la portada primero
    const [bgImage, setBgImage] = useState<string>("");

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setBgImage("/menu-horizontal.jpg");
        } else {
            setBgImage("/menu.jpg");
        }

        const obtenerProductos = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos?pagination[page]=1&pagination[pageSize]=1000`
                );
                const data = response.data.data;
                const allProductos = [...data];

                const productosMap = new Map<string, Producto[]>();
                allProductos.forEach((producto: Producto) => {
                    const tipo = producto.tipo ?? "Desconocido";
                    if (!productosMap.has(tipo)) {
                        productosMap.set(tipo, []);
                    }
                    productosMap.get(tipo)?.push(producto);
                });

                setProductosPorTipo(productosMap);
            } catch (error) {
                console.error("Error al obtener los productos", error);
            }
        };

        obtenerProductos();
    }, []);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            setIndiceTipo((prevIndice) => Math.min(prevIndice + 1, productosPorTipo.size - 1));
        },
        onSwipedRight: () => {
            setIndiceTipo((prevIndice) => Math.max(prevIndice - 1, -1));
        },
    });



    return (
        <div
          className="w-full min-h-screen overflow-auto relative flex items-center justify-center"
          {...handlers}
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {indiceTipo === -1 ? (
            <div className="flex flex-col items-center text-center p-6   rounded-lg shadow-none w-full">
              <h1 className="text-6xl font-serif text-black mb-4">Menú</h1>
              <h2 className="text-2xl font-serif text-black mb-4">Malargüe</h2>
              <p className="text-lg text-black mb-4">Desliza hacia la derecha o elegí una categoría</p>
      
              {/* Lista de tipos con íconos */}
              <div className="flex flex-col items-center w-full px-4 gap-2 md:hidden">
                {[...productosPorTipo.keys()].map((tipo, idx) => (
                  <button
                    key={tipo}
                    onClick={() => setIndiceTipo(idx)}
                    className="flex items-center justify-between w-full bg-[#6b4f2b] text-white px-4 py-3 rounded-lg shadow-md hover:bg-[#5a4024] transition"
                  >
                    <span className="text-left font-medium text-base">{tipo}</span>
                    <SquareChevronRight className="w-5 h-5" />
                  </button>
                ))}
              </div>
      
              <div className="mt-4 animate-bounce hidden md:block absolute top-1/2 right-0 transform -translate-y-1/2">
                <span className="text-black text-4xl cursor-pointer" onClick={() => setIndiceTipo(indiceTipo + 1)}>→</span>
              </div>
            </div>
          ) : (
            [...productosPorTipo.entries()].map(([tipo, productosPorCategoria], indice) => {
              return productosPorCategoria.length > 0 && indice === indiceTipo ? (
                <div
                  key={indice}
                  className="absolute w-full h-full p-6 block shadow-lg"
                  style={{
                    transform: `translateX(0)`,
                    transition: "transform 0.5s ease-in-out",
                    backgroundColor: "transparent",
                    borderRadius: "12px",
                    border: "2px solid #6b4f2b",
                    backgroundImage: "url('/textures/wood-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "fit-content",
                    top: 0,
                    marginTop: window.innerWidth < 768 ? "50px" : "0px",
                  }}
                >
                  <h1
                    className="text-4xl font-serif mb-4 tracking-wider text-[#964B00] flex items-center justify-center gap-2 bg-white/80 p-2 rounded-lg"
                    style={{
                      textAlign: "center",
                      textShadow: "-1px 0 white, 1px 0 white, 0 -1px white, 0 1px white",
                    }}
                  >
                    {indice > 0 && (
                      <span className="md:hidden cursor-pointer" onClick={() => setIndiceTipo(indiceTipo - 1)}>
                        <ArrowLeft className="w-6 h-6" />
                      </span>
                    )}
                    {tipo}
                    {indice < productosPorTipo.size - 1 && (
                      <span className="md:hidden cursor-pointer" onClick={() => setIndiceTipo(indiceTipo + 1)}>
                        <ArrowRight className="w-6 h-6" />
                      </span>
                    )}
                  </h1>
      
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productosPorCategoria.map((producto) => (
                      <div
                        key={producto.id}
                        className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-between"
                        style={{
                          border: "1px solid #6b4f2b",
                          backgroundColor: "#fff5e1",
                        }}
                      >
                        <h2 className="text-2xl font-serif mb-2 text-black text-center">{producto.nombre}</h2>
                        <p className="text-gray-700 mb-2">{producto.Descripcion}</p>
                        <p
                          className="text-lg font-bold text-black p-2 rounded-lg"
                          style={{
                            textAlign: "center",
                            textShadow: "-1px 0 white, 1px 0 white, 0 -1px white, 0 1px white",
                            animation: "saltar 1s infinite",
                            border: "1px solid black",
                            backgroundColor: "transparent",
                            borderRadius: "10px",
                          }}
                        >
                          Precio: ${producto.precio}
                        </p>
                      </div>
                    ))}
                  </div>
      
                  {/* Botón volver al inicio (solo en mobile) */}
                  <div className="mt-8 flex justify-center md:hidden">
                    <button
                      onClick={() => setIndiceTipo(-1)}
                      className="bg-[#6b4f2b] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#5a4024] transition"
                    >
                      Volver al inicio
                    </button>
                  </div>
      
                  {/* Flechas de navegación en desktop */}
                  {indice > 0 && (
                    <div className="mt-4 animate-bounce hidden md:block absolute top-1/2 left-0 transform -translate-y-1/2">
                      <span className="text-black text-4xl cursor-pointer" onClick={() => setIndiceTipo(indiceTipo - 1)}>←</span>
                    </div>
                  )}
                  {indice < productosPorTipo.size - 1 && (
                    <div className="mt-4 animate-bounce hidden md:block absolute top-1/2 right-0 transform -translate-y-1/2">
                      <span className="text-black text-4xl cursor-pointer" onClick={() => setIndiceTipo(indiceTipo + 1)}>→</span>
                    </div>
                  )}
                </div>
              ) : null;
            })
          )}
        </div>
      );
      

};

export default Menu;
