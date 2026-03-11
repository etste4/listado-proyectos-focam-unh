const contenedor = document.getElementById("cards-container");

function mostrarMensaje(texto) {
  contenedor.innerHTML = `<div class="mensaje">${texto}</div>`;
}

function crearCard(proyecto) {
  return `
    <article class="card">
      <div class="badges">
        <span class="badge badge-anio">${proyecto.anio || "Sin año"}</span>
        <span class="badge badge-instituto">${proyecto.instituto || "Sin instituto"}</span>
        <span class="badge badge-estado">${proyecto.estado || "Sin estado"}</span>
      </div>

      <h2>${proyecto.titulo || "Sin título"}</h2>

      <p><strong>Investigador principal:</strong> ${proyecto.investigador || "No registrado"}</p>
      <p><strong>Teléfono:</strong> ${proyecto.telefono || "No registrado"}</p>
      <p><strong>Resolución:</strong> ${proyecto.resolucion || "No registrada"}</p>
      <p><strong>Fecha de inicio:</strong> ${proyecto.fecha_inicio || "No registrada"}</p>
      <p><strong>Fecha de culminación:</strong> ${proyecto.fecha_fin || "No registrada"}</p>
      <p><strong>Observaciones:</strong> ${proyecto.observaciones || "-"}</p>
    </article>
  `;
}

function renderizarProyectos(lista) {
  if (!lista || lista.length === 0) {
    mostrarMensaje("No hay proyectos para mostrar.");
    return;
  }

  contenedor.innerHTML = lista.map(crearCard).join("");
}

function normalizarTexto(valor) {
  return (valor || "").toString().trim();
}

function cargarProyectos() {
  mostrarMensaje("Cargando proyectos...");

  Papa.parse(CONFIG.CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const proyectos = results.data.map((fila) => ({
        id: normalizarTexto(fila.id),
        anio: normalizarTexto(fila.anio),
        titulo: normalizarTexto(fila.titulo),
        investigador: normalizarTexto(fila.investigador),
        telefono: normalizarTexto(fila.telefono),
        resolucion: normalizarTexto(fila.resolucion),
        fecha_inicio: normalizarTexto(fila.fecha_inicio),
        fecha_fin: normalizarTexto(fila.fecha_fin),
        instituto: normalizarTexto(fila.instituto),
        estado: normalizarTexto(fila.estado),
        observaciones: normalizarTexto(fila.observaciones)
      }));

      renderizarProyectos(proyectos);
    },
    error: function (error) {
      console.error("Error al leer el CSV:", error);
      mostrarMensaje("Ocurrió un error al cargar los datos del CSV.");
    }
  });
}

cargarProyectos();