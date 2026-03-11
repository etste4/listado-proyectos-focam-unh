const contenedor = document.getElementById("cards-container");

const totalProyectosEl = document.getElementById("total-proyectos");
const totalIngenieriaEl = document.getElementById("total-ingenieria");
const totalSocialesEl = document.getElementById("total-sociales");
const totalVigentesEl = document.getElementById("total-vigentes");

const buscadorEl = document.getElementById("buscador");
const filtroAnioEl = document.getElementById("filtro-anio");
const filtroInstitutoEl = document.getElementById("filtro-instituto");
const filtroEstadoEl = document.getElementById("filtro-estado");

let proyectosOriginales = [];
let proyectosFiltrados = [];

function mostrarMensaje(texto) {
  contenedor.innerHTML = `<div class="mensaje">${texto}</div>`;
}

function normalizarTexto(valor) {
  return (valor || "").toString().trim();
}

function capitalizarTexto(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function normalizarInstituto(instituto) {
  const valor = normalizarTexto(instituto).toUpperCase();
  if (valor.includes("INGEN")) return "INGENIERIA";
  if (valor.includes("SOCIA")) return "SOCIALES";
  return valor;
}

function obtenerClaseInstituto(instituto) {
  const valor = normalizarInstituto(instituto);
  if (valor === "INGENIERIA") return "ingenieria";
  if (valor === "SOCIALES") return "sociales";
  return "";
}

function crearCard(proyecto) {
  const claseInstituto = obtenerClaseInstituto(proyecto.instituto);

  return `
    <article class="card ${claseInstituto}">
      <div class="badges">
        <span class="badge badge-anio">${proyecto.anio || "Sin año"}</span>
        <span class="badge badge-instituto">${capitalizarTexto(proyecto.instituto) || "Sin instituto"}</span>
        <span class="badge badge-estado">${capitalizarTexto(proyecto.estado) || "Sin estado"}</span>
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
    mostrarMensaje("No se encontraron proyectos con los filtros aplicados.");
    return;
  }

  contenedor.innerHTML = lista.map(crearCard).join("");
}

function actualizarDashboard(lista) {
  const total = lista.length;

  const totalIngenieria = lista.filter(
    (p) => normalizarInstituto(p.instituto) === "INGENIERIA"
  ).length;

  const totalSociales = lista.filter(
    (p) => normalizarInstituto(p.instituto) === "SOCIALES"
  ).length;

  const totalVigentes = lista.filter(
    (p) => normalizarTexto(p.estado).toUpperCase() === "VIGENTE"
  ).length;

  totalProyectosEl.textContent = total;
  totalIngenieriaEl.textContent = totalIngenieria;
  totalSocialesEl.textContent = totalSociales;
  totalVigentesEl.textContent = totalVigentes;
}

function llenarSelect(selectElement, valores) {
  const valorActual = selectElement.value;

  const opciones = ['<option value="">Todos</option>']
    .concat(
      valores.map((valor) => `<option value="${valor}">${capitalizarTexto(valor)}</option>`)
    )
    .join("");

  selectElement.innerHTML = opciones;

  if ([...selectElement.options].some((op) => op.value === valorActual)) {
    selectElement.value = valorActual;
  }
}

function cargarOpcionesFiltros(lista) {
  const anios = [...new Set(lista.map((p) => normalizarTexto(p.anio)).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a));

  const institutos = [...new Set(lista.map((p) => normalizarInstituto(p.instituto)).filter(Boolean))]
    .sort();

  const estados = [...new Set(lista.map((p) => normalizarTexto(p.estado).toUpperCase()).filter(Boolean))]
    .sort();

  llenarSelect(filtroAnioEl, anios);
  llenarSelect(filtroInstitutoEl, institutos);
  llenarSelect(filtroEstadoEl, estados);
}

function aplicarFiltros() {
  const textoBusqueda = normalizarTexto(buscadorEl.value).toLowerCase();
  const anioSeleccionado = filtroAnioEl.value;
  const institutoSeleccionado = filtroInstitutoEl.value;
  const estadoSeleccionado = filtroEstadoEl.value;

  proyectosFiltrados = proyectosOriginales.filter((proyecto) => {
    const textoCompleto = [
      proyecto.titulo,
      proyecto.investigador,
      proyecto.resolucion,
      proyecto.instituto,
      proyecto.estado
    ]
      .join(" ")
      .toLowerCase();

    const coincideBusqueda =
      !textoBusqueda || textoCompleto.includes(textoBusqueda);

    const coincideAnio =
      !anioSeleccionado || normalizarTexto(proyecto.anio) === anioSeleccionado;

    const coincideInstituto =
      !institutoSeleccionado ||
      normalizarInstituto(proyecto.instituto) === institutoSeleccionado;

    const coincideEstado =
      !estadoSeleccionado ||
      normalizarTexto(proyecto.estado).toUpperCase() === estadoSeleccionado;

    return (
      coincideBusqueda &&
      coincideAnio &&
      coincideInstituto &&
      coincideEstado
    );
  });

  renderizarProyectos(proyectosFiltrados);
  actualizarDashboard(proyectosFiltrados);
}

function cargarProyectos() {
  mostrarMensaje("Cargando proyectos...");

  Papa.parse(CONFIG.CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      proyectosOriginales = results.data.map((fila) => ({
        id: normalizarTexto(fila.id),
        anio: normalizarTexto(fila.anio),
        titulo: normalizarTexto(fila.titulo),
        investigador: normalizarTexto(fila.investigador),
        telefono: normalizarTexto(fila.telefono),
        resolucion: normalizarTexto(fila.resolucion),
        fecha_inicio: normalizarTexto(fila.fecha_inicio),
        fecha_fin: normalizarTexto(fila.fecha_fin),
        instituto: normalizarInstituto(fila.instituto),
        estado: normalizarTexto(fila.estado).toUpperCase(),
        observaciones: normalizarTexto(fila.observaciones)
      }));

      proyectosOriginales.sort((a, b) => Number(b.anio) - Number(a.anio));

      cargarOpcionesFiltros(proyectosOriginales);
      aplicarFiltros();
    },
    error: function (error) {
      console.error("Error al leer el CSV:", error);
      mostrarMensaje("Ocurrió un error al cargar los datos del CSV.");
    }
  });
}

buscadorEl.addEventListener("input", aplicarFiltros);
filtroAnioEl.addEventListener("change", aplicarFiltros);
filtroInstitutoEl.addEventListener("change", aplicarFiltros);
filtroEstadoEl.addEventListener("change", aplicarFiltros);

cargarProyectos();