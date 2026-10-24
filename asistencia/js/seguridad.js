(() => {
    "use strict";
    const CLAVE = "instituciones-escolares";
    const SESION = "sesion-escolar-activa";
    const PAGINAS = ["inicio.html", "estudiantes.html", "registros.html", "configuracion.html"];
    const pagina = location.pathname.split("/").pop().toLowerCase();
    if (!PAGINAS.includes(pagina) || (pagina === "inicio.html" && sessionStorage.getItem(SESION) === "true")) return;
    function leer() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE) || "[]");
            return Array.isArray(datos) ? datos : [];
        } catch {
            return [];
        }
    }
    function iniciar() {
        const estilo = document.createElement("style");
        estilo.textContent = `
            #acceso-inicial{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;overflow:auto;padding:20px;background:#000;color:#ffcc00;font-family:Arial,sans-serif;box-sizing:border-box}
            #acceso-inicial form{width:min(380px,100%);padding:26px;background:#000;border:2px solid #ffcc00;border-radius:12px;text-align:center;box-sizing:border-box}
            #acceso-inicial p{color:#fff;font-size:14px}
            #acceso-inicial .campo{display:flex;margin:14px 0 10px;border:1px solid #ffcc00;border-radius:6px;overflow:hidden}
            #acceso-inicial input{width:100%;min-width:0;padding:12px;background:#000;color:#fff;border:1px solid #ffcc00;border-radius:6px;box-sizing:border-box;margin:6px 0}
            #acceso-inicial .campo input{border:0;margin:0}
            #acceso-inicial button{padding:12px;background:#ffcc00;color:#000;border:0;border-radius:5px;font-weight:bold;cursor:pointer}
            #acceso-inicial .ojo{min-width:46px;border-radius:0}
            #acceso-inicial .entrar,#acceso-inicial .crear,#acceso-inicial .alternar{width:100%;margin-top:8px}
            #acceso-inicial .alternar{background:#000;color:#ffcc00;border:1px solid #ffcc00}
            #acceso-inicial #error-acceso{min-height:18px;color:#ffcc00;font-size:13px}
            #acceso-inicial [hidden]{display:none!important}`;
        document.head.appendChild(estilo);
        const capa = document.createElement("div");
        capa.id = "acceso-inicial";
        capa.innerHTML = `
            <form id="form-acceso">
                <h2>Asistencia Escolar</h2>
                <p id="texto-acceso"></p>
                <div id="campos-registro" hidden>
                    <input id="nombre-inst" placeholder="Nombre de la institución" required>
                    <input id="nit-inst" placeholder="NIT" required>
                    <input id="direccion-inst" placeholder="Dirección" required>
                    <input id="correo-inst" type="email" placeholder="Correo de la institución" required>
                    <input id="telefono-inst" placeholder="Teléfono" required>
                    <input id="ciudad-inst" placeholder="Ciudad" required>
                    <input id="correo-admin" type="email" placeholder="Correo del administrador" required>
                </div>
                <div class="campo">
                    <input id="clave-inicial" type="password" placeholder="Contraseña" autocomplete="current-password" required>
                    <button class="ojo" id="ojo-inicial" type="button" aria-label="Mostrar contraseña"><i class="fa-solid fa-eye"></i></button>
                </div>
                <div id="confirmacion" hidden><input id="confirmar-clave" type="password" placeholder="Confirmar contraseña" autocomplete="new-password"></div>
                <div id="error-acceso" role="alert"></div>
                <button class="entrar" id="boton-entrar" type="submit">Ingresar</button>
                <button class="crear" id="boton-crear" type="button">Crear primera cuenta</button>
                <button class="alternar" id="boton-volver" type="button" hidden>Volver a iniciar sesión</button>
            </form>`;
        document.body.appendChild(capa);
        const form = document.getElementById("form-acceso");
        const campo = document.getElementById("clave-inicial");
        const campos = document.getElementById("campos-registro");
        const confirmacion = document.getElementById("confirmacion");
        const error = document.getElementById("error-acceso");
        const crear = document.getElementById("boton-crear");
        const volver = document.getElementById("boton-volver");
        let registro = leer().length === 0;
        function modoRegistro(activo) {
            registro = activo;
            campos.hidden = !activo;
            confirmacion.hidden = !activo;
            campos.querySelectorAll("input").forEach(i => i.required = activo);
            document.getElementById("confirmar-clave").required = activo;
            document.getElementById("texto-acceso").textContent = activo ? "Crea la cuenta de administrador de tu institución." : "Ingresa la contraseña del administrador para continuar.";
            document.getElementById("boton-entrar").textContent = activo ? "Crear cuenta" : "Ingresar";
            crear.hidden = activo || leer().length > 0;
            volver.hidden = !activo;
            campo.value = "";
            campo.autocomplete = activo ? "new-password" : "current-password";
            error.textContent = "";
        }
        function salir() {
            sessionStorage.setItem(SESION, "true");
            capa.remove();
            estilo.remove();
        }
        crear.addEventListener("click", () => modoRegistro(true));
        volver.addEventListener("click", () => modoRegistro(false));
        document.getElementById("ojo-inicial").addEventListener("click", e => {
            const mostrar = campo.type === "password";
            campo.type = mostrar ? "text" : "password";
            e.currentTarget.innerHTML = mostrar ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            e.currentTarget.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
        });
        form.addEventListener("submit", e => {
            e.preventDefault();
            const lista = leer();
            const clave = campo.value;
            if (registro) {
                const valor = id => document.getElementById(id).value.trim();
                const nombre = valor("nombre-inst");
                const nit = valor("nit-inst");
                const direccion = valor("direccion-inst");
                const correo = valor("correo-inst").toLowerCase();
                const telefono = valor("telefono-inst");
                const ciudad = valor("ciudad-inst");
                const email = valor("correo-admin").toLowerCase();
                const confirmar = valor("confirmar-clave");
                if (!nombre || !nit || !direccion || !correo || !telefono || !ciudad || !email) {
                    error.textContent = "Completa todos los campos.";
                    return;
                }
                if (lista.length) {
                    error.textContent = "Ya existe una cuenta. Inicia sesión.";
                    modoRegistro(false);
                    return;
                }
                if (clave.length < 8) {
                    error.textContent = "La contraseña debe tener al menos 8 caracteres.";
                    return;
                }
                if (clave !== confirmar) {
                    error.textContent = "Las contraseñas no coinciden.";
                    return;
                }
                lista.push({ nombre, nit, direccion, correo, telefono, ciudad, correoAdmin: email, contrasena: clave });
                try {
                    localStorage.setItem(CLAVE, JSON.stringify(lista));
                    salir();
                } catch {
                    error.textContent = "No se pudo guardar la cuenta en este navegador.";
                }
            } else {
                if (!lista.some(c => String(c.contrasena ?? "") === clave)) {
                    error.textContent = lista.length ? "Contraseña incorrecta. Inténtalo de nuevo." : "No hay una cuenta registrada. Crea la primera cuenta.";
                    campo.select();
                    return;
                }
                salir();
            }
        });
        modoRegistro(registro);
        campo.focus();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else iniciar();
})();