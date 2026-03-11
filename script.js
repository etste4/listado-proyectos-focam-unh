const btnProbar = document.getElementById("btnProbar");
const resultado = document.getElementById("resultado");

btnProbar.addEventListener("click", () => {
  resultado.textContent = "Todo está funcionando correctamente.";
  console.log("Sistema:", CONFIG.nombreSistema);
});