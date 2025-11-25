document.addEventListener("DOMContentLoaded", () => {
    carregarPacientes();

    const tabela = document.getElementById("tabelaContainer")
    const mensagemVazia = document.getElementById("mensagemVazia")
    const campoBusca = document.getElementById("campoBusca");

    campoBusca.addEventListener("input", () => {
        buscarPacientes(campoBusca.value.trim());
    });

    const form = document.getElementById("formPaciente");
    const btnAdicionarCampo = document.getElementById("btnAdicionarCampo");
    const novosCampos = document.getElementById("novosCampos");
    const modalAdicionarPaciente = new bootstrap.Modal(document.getElementById("modalAdicionarPaciente"));

    /* ---------------------- UTIL ------------------------------ */
    // formata tempo "08:00:00" -> "08:00", aceita também "08:00"
    function formatTimeForInput(t) {
        if (!t) return "";
        // se for ISO com fuso/extras, tenta extrair HH:mm
        // exemplos: "08:00:00", "08:00", "08:00:00.000"
        const m = t.match(/(\d{2}:\d{2})/);
        return m ? m[1] : "";
    }

    /* ---------------------- CARREGAR PACIENTES ---------------- */

    async function carregarPacientes() {
        try {
            const response = await fetch("/api/pacientes");
            const pacientes = await response.json();

            const tbody = document.getElementById("tabelaPacientes");
            tbody.innerHTML = "";

            if (!pacientes || pacientes.length === 0) {
                tabela.classList.add("d-none")
                mensagemVazia.classList.remove("d-none")
                return;
            }

            mensagemVazia.classList.add("d-none")
            tabela.classList.remove("d-none")

            pacientes.forEach(p => {
                tbody.appendChild(criarLinhaPaciente(p));
            });

        } catch (e) {
            console.error("Erro ao carregar pacientes:", e);
        }
    }

    /* ---------------------- CALCULAR IDADE -------------------- */

    function calcularIdade(dataNasc) {
        if (!dataNasc) return "—";
        const hoje = new Date();
        const nasc = new Date(dataNasc);
        if (isNaN(nasc)) return "—";
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return idade;
    }

    async function buscarPacientes(termo) {
        const endpoint = termo ? `/api/pacientes/search?termo=${encodeURIComponent(termo)}` : `/api/pacientes`;

        try {
            const response = await fetch(endpoint);
            const pacientes = await response.json();

            const tbody = document.getElementById("tabelaPacientes");
            tbody.innerHTML = "";

            if (pacientes.length === 0) {
                tabela.classList.add("d-none")
                mensagemVazia.classList.remove("d-none")
                return;
            }

            mensagemVazia.classList.add("d-none")
            tabela.classList.remove("d-none")

            pacientes.forEach(p => {
                tbody.appendChild(criarLinhaPaciente(p));
            });

        } catch (e) {
            console.error("Erro ao buscar:", e);
        }
    }

    /* ---------------------- MONTAR LINHA ----------------------- */

    function criarLinhaPaciente(p) {
        const tr = document.createElement("tr");
        
        // Adiciona o ID do paciente como atributo data-id na linha
        tr.dataset.id = p.id;

        const idade = calcularIdade(p.dataNascimento);

        const diabetesIcon = p.possuiDiabetes ? `<i class="bi bi-star-fill text-primary me-1"></i>` : '';
        const hipertensoIcon = p.hipertenso ? `<i class="bi bi-star-fill text-danger me-1"></i>` : '';

        tr.innerHTML = `
            <td>${hipertensoIcon}${diabetesIcon} ${p.nomeCompleto}</td>
            <td>${p.telefone || "—"}</td>
            <td>${p.endereco || "—"}</td>
            <td>${p.observacoesGerais || "—"}</td>
            <td>${idade}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-excluir ms-1" data-id="${p.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        return tr;
    }

    document.querySelector("#offcanvasFiltros form").addEventListener("submit", function(e) {
        e.preventDefault();
        aplicarFiltros();
    });

    function aplicarFiltros() {
        const genero = document.getElementById("filtroGenero").value || null;
        const faixa = document.getElementById("filtroIdade").value || null;
        const diabetes = document.getElementById("filtroDiabetes").value || null;
        const hipertenso = document.getElementById("filtroHipertenso").value || null;

        const search = document.getElementById("campoBusca")?.value || null;
        const tamanho = document.getElementById("selectTamanhoLista")?.value || null;

        const params = new URLSearchParams();

        if (genero) params.append("genero", genero);
        if (faixa) params.append("faixaEtaria", faixa);
        if (diabetes) params.append("possuiDiabetes", diabetes);
        if (hipertenso) params.append("hipertenso", hipertenso);
        if (search) params.append("search", search);
        if (tamanho) params.append("tamanho", tamanho);

        fetch(`/api/pacientes/filter?` + params.toString())
            .then(r => r.json())
            .then(lista => atualizarTabela(lista));

            const offcanvas = bootstrap.Offcanvas.getInstance(
                document.getElementById("offcanvasFiltros")
            );
            offcanvas.hide();
    }

    function atualizarTabela(pacientes) {
        const tbody = document.getElementById("tabelaPacientes");
        tbody.innerHTML = "";

        if (pacientes.length === 0) {
            tabela.classList.add("d-none")
            mensagemVazia.classList.remove("d-none")
            return;
        }

        mensagemVazia.classList.add("d-none")
        tabela.classList.remove("d-none")

        pacientes.forEach(p => {
            tbody.appendChild(criarLinhaPaciente(p));
        });
    }

    /* ---------------------- BUSCAR PACIENTE ---------------------- */

    async function buscarPacientePorId(id) {
        const resp = await fetch(`/api/pacientes/${id}`);
        if (!resp.ok) {
            throw new Error("Erro ao buscar paciente: " + resp.statusText);
        }
        return resp.json();
    }

    /* ---------------------- PREENCHER MODAL EDIÇÃO ---------------------- */

    function preencherModalEdicao(paciente) {
        document.getElementById("idPaciente").value = paciente.id;
        document.getElementById("nomePaciente").value = paciente.nomeCompleto;
        document.getElementById("dataNascimento").value = paciente.dataNascimento || "";
        document.getElementById("telefonePaciente").value = paciente.telefone || "";
        document.getElementById("telefone2Paciente").value = paciente.telefoneSecundario || "";
        document.getElementById("enderecoPaciente").value = paciente.endereco || "";
        document.getElementById("observacoesPaciente").value = paciente.observacoesGerais || "";
        document.getElementById("sobrePaciente").value = paciente.sobrePaciente || "";
        document.getElementById("generoPaciente").value = paciente.genero || "";
        document.getElementById("diabetesPaciente").checked = paciente.possuiDiabetes;
        document.getElementById("hptsPaciente").checked = paciente.hipertenso;
        
        // Mudar o título do modal
        document.querySelector("#modalAdicionarPaciente .modal-title").textContent = "Editar paciente";
    }

    /* ---------------------- EXCLUIR PACIENTE --------------------- */

    document.addEventListener("click", async (e) => {
        const btnExcluir = e.target.closest(".btn-excluir");
        const btnEditar = e.target.closest(".btn-editar");
        
        if (btnExcluir) {
            if (!confirm("Deseja realmente excluir este paciente?")) return;

            const id = btnExcluir.dataset.id;
            await fetch(`/api/pacientes/${id}`, { method: "DELETE" });

            carregarPacientes();
        } else if (btnEditar) {
            e.stopPropagation(); // Impede que o clique chegue à linha da tabela
            const id = btnEditar.dataset.id;
            try {
                const paciente = await buscarPacientePorId(id);
                preencherModalEdicao(paciente);
                const modal = new bootstrap.Modal(document.getElementById("modalAdicionarPaciente"));
                modal.show();
            } catch (error) {
                console.error("Erro ao carregar paciente para edição:", error);
                alert("Erro ao carregar paciente para edição.");
            }
        }
    });

    /* ---------------------- CAMPOS DINÂMICOS --------------------- */

    btnAdicionarCampo.addEventListener("click", () => {
        const div = document.createElement("div");
        div.classList.add("col-md-6", "mt-2");
        div.innerHTML = `<input type="text" class="form-control" placeholder="Novo campo personalizado">`;
        novosCampos.appendChild(div);
    });

    /* ---------------------- SALVAR PACIENTE ---------------------- */

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = document.getElementById("idPaciente").value;

        const paciente = {
            nomeCompleto: document.getElementById("nomePaciente").value,
            dataNascimento: document.getElementById("dataNascimento").value || null,
            telefone: document.getElementById("telefonePaciente").value || null,
            telefoneSecundario: document.getElementById("telefone2Paciente").value || null,
            endereco: document.getElementById("enderecoPaciente").value || null,
            observacoesGerais: document.getElementById("observacoesPaciente").value || null,
            sobrePaciente: document.getElementById("sobrePaciente").value || null,
            genero: document.getElementById("generoPaciente").value || null,
            possuiDiabetes: document.getElementById("diabetesPaciente").checked,
            hipertenso: document.getElementById("hptsPaciente").checked, // Adicionado campo hipertenso
        };

        const metodo = id ? "PUT" : "POST";
        const url = id ? `/api/pacientes/${id}` : `/api/pacientes`;

        try {
            const resp = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paciente)
            });

            if (!resp.ok) {
                const text = await resp.text();
                console.error("Erro ao salvar paciente:", resp.status, text);
                alert("Erro ao salvar paciente. Veja console para detalhes.");
                return;
            }

    modalAdicionarPaciente.hide();
    form.reset();
    document.querySelector("#modalAdicionarPaciente .modal-title").textContent = "Adicionar paciente"; // Resetar título
    carregarPacientes();
        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro de rede ao salvar paciente. Veja console.");
        }
    });

     /* ----------------- MODAL REGISTRO DE PACIENTES --------------- */
     document.getElementById("tabelaPacientes").addEventListener("click", function (e) {

       if (e.target.closest(".btn-excluir") || e.target.closest(".btn-editar")) return;

       const linha = e.target.closest("tr");
       if (!linha) return;

       const pacienteId = linha.dataset.id;
       
       // Validação do ID do paciente
       if (!pacienteId || pacienteId === 'undefined') {
         console.error('ID do paciente inválido');
         return;
       }
       
       document.getElementById("idPacienteRegistro").value = pacienteId;
       
       // Resetar estado do modal antes de abrir
       resetarModalRegistro();
       
       // Carregar dados do paciente e última medição
       carregarDadosPaciente(pacienteId);

       const modal = new bootstrap.Modal(
         document.getElementById("modalRegistroPaciente")
       );
       modal.show();
     });

     /* ----------------- FUNÇÕES DO MODAL DE REGISTRO --------------- */
     
     function resetarModalRegistro() {
       // Limpar todos os campos de medição atual
       document.querySelectorAll('[id^="atual_"]').forEach((input) => {
         input.value = "";
         input.disabled = true;
       });
       
       // Resetar botões para estado inicial
       document.getElementById("btnEditar").classList.remove("d-none");
       document.getElementById("btnSalvar").classList.add("d-none");
     }
     
     function habilitarEdicao() {
       // habilita todos os campos da medição atual
       document.querySelectorAll('[id^="atual_"]').forEach((input) => {
         input.disabled = false;
       });

       // troca os botões
       document.getElementById("btnEditar").classList.add("d-none");
       document.getElementById("btnSalvar").classList.remove("d-none");
     }
     async function salvarMedicao() {
       const pacienteId = document.getElementById("idPacienteRegistro").value; // ID do paciente deve estar no modal
       
       const registro = {
         pressaoArterial: document.getElementById("atual_pa").value || null,
         glicemia: document.getElementById("atual_glicemia").value || null,
         escalaDor: document.getElementById("atual_dor").value || null,
         saturacaoO2: document.getElementById("atual_o2").value || null,
         bpm: document.getElementById("atual_bpm").value || null,
         observacao: document.getElementById("atual_obs").value || null,
       };

       try {
         const resp = await fetch(`/api/registros/paciente/${pacienteId}`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(registro),
         });

         if (!resp.ok) {
           const text = await resp.text();
           console.error("Erro ao salvar medição:", resp.status, text);
           alert("Erro ao salvar medição. Veja console para detalhes.");
           return;
         }

         alert("Medição salva com sucesso!");
         
         // Limpar campos de medição atual
         document.querySelectorAll('[id^="atual_"]').forEach((input) => {
           input.value = "";
           input.disabled = true;
         });

         // Resetar botões
         document.getElementById("btnSalvar").classList.add("d-none");
         document.getElementById("btnEditar").classList.remove("d-none");
         
         // Recarrega os dados do paciente para atualizar a última medição
         carregarDadosPaciente(pacienteId); 

       } catch (err) {
         console.error("Erro na requisição:", err);
         alert("Erro de rede ao salvar medição. Veja console.");
       }
     }
     document.getElementById("btnEditar").addEventListener("click", habilitarEdicao);
     document.getElementById("btnSalvar").addEventListener("click", salvarMedicao);

     // Código de modal adicional removido para evitar erros

     async function carregarDadosPaciente(pacienteId) {
       // 1. Carregar última medição
       try {
         const resp = await fetch(`/api/registros/paciente/${pacienteId}/ultima`);
         if (resp.ok) {
           const ultimaMedicao = await resp.json();
           document.getElementById("ultima_pa").value = ultimaMedicao.pressaoArterial || "";
           document.getElementById("ultima_glicemia").value = ultimaMedicao.glicemia || "";
           document.getElementById("ultima_dor").value = ultimaMedicao.escalaDor || "";
           document.getElementById("ultima_o2").value = ultimaMedicao.saturacaoO2 || "";
           document.getElementById("ultima_bpm").value = ultimaMedicao.bpm || "";
           document.getElementById("ultima_obs").value = ultimaMedicao.observacao || "";
         } else {
           // Limpar campos se não houver última medição
           document.getElementById("ultima_pa").value = "";
           document.getElementById("ultima_glicemia").value = "";
           document.getElementById("ultima_dor").value = "";
           document.getElementById("ultima_o2").value = "";
           document.getElementById("ultima_bpm").value = "";
           document.getElementById("ultima_obs").value = "";
         }
       } catch (err) {
         console.error("Erro ao carregar última medição:", err);
       }
     }
});
