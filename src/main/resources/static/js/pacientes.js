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

    // Variável global para armazenar o ID do paciente selecionado
    let pacienteIdSelecionado = null;

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

    /* ---------------------- BUSCAR PACIENTES -------------------- */
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

    /* ---------------------- APLICAR FILTROS ---------------------- */
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

    /* ---------------------- BUSCAR PACIENTE POR ID ---------------------- */
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

        document.querySelector("#modalAdicionarPaciente .modal-title").textContent = "Editar paciente";
    }

    /* ========== ÚNICO LISTENER DE CLIQUES - GERENCIA TUDO ========== */
    document.addEventListener("click", async (e) => {
        // 1. BOTÃO EXCLUIR
        const btnExcluir = e.target.closest(".btn-excluir");
        if (btnExcluir) {
            e.stopPropagation();
            if (!confirm("Deseja realmente excluir este paciente?")) return;

            const id = btnExcluir.dataset.id;
            await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
            carregarPacientes();
            return;
        }

        // 2. BOTÃO EDITAR
        const btnEditar = e.target.closest(".btn-editar");
        if (btnEditar) {
            e.stopPropagation();
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
            return;
        }

        // 3. LINHA DA TABELA (abre ficha do paciente)
        const linha = e.target.closest("#tabelaPacientes tr");
        if (linha) {
            const pacienteId = linha.dataset.id;

            if (!pacienteId || pacienteId === 'undefined') {
                console.error('ID do paciente inválido');
                return;
            }

            pacienteIdSelecionado = pacienteId;
            carregarFichaPaciente(pacienteId);

            const modal = new bootstrap.Modal(document.getElementById("modalFichaPaciente"));
            modal.show();
        }
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
            hipertenso: document.getElementById("hptsPaciente").checked,
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
            document.querySelector("#modalAdicionarPaciente .modal-title").textContent = "Adicionar paciente";
            carregarPacientes();
        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro de rede ao salvar paciente. Veja console.");
        }
    });

    /* ----------------- CARREGAR FICHA DO PACIENTE --------------- */
    async function carregarFichaPaciente(pacienteId) {
        try {
            const resp = await fetch(`/api/pacientes/${pacienteId}`);
            if (!resp.ok) {
                throw new Error("Erro ao buscar dados do paciente");
            }
            const paciente = await resp.json();

            document.getElementById("fichaNomePaciente").textContent = paciente.nomeCompleto || "—";
            document.getElementById("fichaDataNascimento").textContent = paciente.dataNascimento || "—";
            document.getElementById("fichaGeneroPaciente").textContent = paciente.genero || "—";
            document.getElementById("fichaTelefonePaciente").textContent = paciente.telefone || "—";
            document.getElementById("fichaTelefone2Paciente").textContent = paciente.telefoneSecundario || "—";
            document.getElementById("fichaEnderecoPaciente").textContent = paciente.endereco || "—";
            document.getElementById("fichaSobrePaciente").textContent = paciente.sobrePaciente || "—";
            document.getElementById("fichaObservacoesPaciente").textContent = paciente.observacoesGerais || "—";

            carregarConsultasPaciente(pacienteId);

        } catch (err) {
            console.error("Erro ao carregar ficha do paciente:", err);
            alert("Erro ao carregar dados do paciente.");
        }
    }

    /* ----------------- CARREGAR CONSULTAS DO PACIENTE --------------- */
    async function carregarConsultasPaciente(pacienteId) {
        const listaConsultas = document.getElementById("listaConsultasPaciente");

        listaConsultas.innerHTML = `
            <div class="text-center text-muted p-4">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                Carregando consultas...
            </div>
        `;

        try {
            const resp = await fetch(`/api/consultas/paciente/${pacienteId}`);

            if (!resp.ok) {
                if (resp.status === 404) {
                    listaConsultas.innerHTML = `
                        <div class="text-center text-muted p-4">
                            <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
                            <p>Nenhuma consulta agendada</p>
                        </div>
                    `;
                    return;
                }
                throw new Error(`Erro ${resp.status}: ${resp.statusText}`);
            }

            const consultas = await resp.json();

            if (!consultas || consultas.length === 0) {
                listaConsultas.innerHTML = `
                    <div class="text-center text-muted p-4">
                        <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
                        <p>Nenhuma consulta agendada</p>
                    </div>
                `;
                return;
            }

            consultas.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));

            listaConsultas.innerHTML = consultas.map(consulta => {
                const dataInicio = new Date(consulta.dataInicio);
                const dataFim = new Date(consulta.dataFim);
                const dataFormatada = dataInicio.toLocaleDateString('pt-BR');
                const horaInicio = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const horaFim = dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                const status = consulta.status || 'sem_aula';
                const statusNomes = {
                    'sem_aula': 'Agendada',
                    'presenca': 'Presente',
                    'falta': 'Falta',
                    'falta_justificada': 'Falta Justificada',
                    'alta_temporaria': 'Alta Temporária'
                };
                const statusCores = {
                    'sem_aula': 'secondary',
                    'presenca': 'success',
                    'falta': 'danger',
                    'falta_justificada': 'warning',
                    'alta_temporaria': 'info'
                };

                return `
                    <div class="consulta-item ${status} mb-3 p-3 border rounded" style="background-color: white;">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="consulta-tipo fw-bold">${consulta.tipoConsulta || 'Consulta'}</div>
                            <span class="badge bg-${statusCores[status]} badge-status">
                                ${statusNomes[status]}
                            </span>
                        </div>
                        <div class="consulta-data text-muted mb-1">
                            <i class="bi bi-calendar3 me-1"></i>${dataFormatada}
                        </div>
                        <div class="consulta-data text-muted">
                            <i class="bi bi-clock me-1"></i>${horaInicio} - ${horaFim}
                        </div>
                        ${consulta.observacoes ? `
                            <div class="consulta-data text-muted mt-2">
                                <i class="bi bi-chat-left-text me-1"></i>${consulta.observacoes}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

        } catch (err) {
            console.error("Erro ao carregar consultas:", err);

            listaConsultas.innerHTML = `
                <div class="text-center text-danger p-4">
                    <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                    <p class="mb-2">Erro ao carregar consultas</p>
                    <small class="text-muted">${err.message}</small>
                    <button class="btn btn-sm btn-outline-primary mt-3" onclick="window.carregarConsultasPaciente(${pacienteId})">
                        <i class="bi bi-arrow-clockwise me-1"></i>Tentar novamente
                    </button>
                </div>
            `;
        }
    }

    window.carregarConsultasPaciente = carregarConsultasPaciente;

     document.getElementById("btnEditarFicha").addEventListener("click", async () => {
         if (!pacienteIdSelecionado) return;

         const modalFicha = bootstrap.Modal.getInstance(document.getElementById("modalFichaPaciente"));
         if (modalFicha) modalFicha.hide();

         try {
             const paciente = await buscarPacientePorId(pacienteIdSelecionado);
             preencherModalEdicao(paciente);

             const modalAdicionar = new bootstrap.Modal(document.getElementById("modalAdicionarPaciente"));
             modalAdicionar.show();
         } catch (err) {
             console.error("Erro ao carregar paciente para edição:", err);
             alert("Erro ao carregar paciente para edição.");
         }
     });

    /* ----------------- BOTÃO PRÓXIMO - ABRE MODAL DE REGISTRO --------------- */
   document.getElementById("btnProximoFicha").addEventListener("click", () => {
       if (!pacienteIdSelecionado) return;

       const modalFicha = bootstrap.Modal.getInstance(document.getElementById("modalFichaPaciente"));
       modalFicha.hide();

       // Abrir modal de registro após fechar ficha
       modalFicha._element.addEventListener('hidden.bs.modal', () => {
           document.getElementById("idPacienteRegistro").value = pacienteIdSelecionado;
           resetarModalRegistro();
           carregarDadosPaciente(pacienteIdSelecionado);

           const modalRegistro = new bootstrap.Modal(document.getElementById("modalRegistroPaciente"));
           modalRegistro.show();
       }, { once: true });
   });

    /* ----------------- MODAL DE REGISTRO - FUNÇÕES --------------- */
    function resetarModalRegistro() {
        document.querySelectorAll('[id^="atual_"]').forEach((input) => {
            input.value = "";
            input.disabled = true;
        });

        document.getElementById("btnEditar").classList.remove("d-none");
        document.getElementById("btnSalvar").classList.add("d-none");
    }

    function habilitarEdicao() {
        document.querySelectorAll('[id^="atual_"]').forEach((input) => {
            input.disabled = false;
        });

        document.getElementById("btnEditar").classList.add("d-none");
        document.getElementById("btnSalvar").classList.remove("d-none");
    }

    async function salvarMedicao() {
        const pacienteId = document.getElementById("idPacienteRegistro").value;

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

            document.querySelectorAll('[id^="atual_"]').forEach((input) => {
                input.value = "";
                input.disabled = true;
            });

            document.getElementById("btnSalvar").classList.add("d-none");
            document.getElementById("btnEditar").classList.remove("d-none");

            carregarDadosPaciente(pacienteId);

        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro de rede ao salvar medição. Veja console.");
        }
    }

    document.getElementById("btnEditar").addEventListener("click", habilitarEdicao);
    document.getElementById("btnSalvar").addEventListener("click", salvarMedicao);

    async function carregarDadosPaciente(pacienteId) {
        try {
            const respPaciente = await fetch(`/api/pacientes/${pacienteId}`);
            if (respPaciente.ok) {
                const paciente = await respPaciente.json();
                const colunaHeader = document.querySelector("#modalRegistroPaciente .row.fw-semibold .col-4:first-child");
                if (colunaHeader) {
                    colunaHeader.textContent = paciente.nomeCompleto;
                }
            }

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
                document.getElementById("ultima_pa").value = "";
                document.getElementById("ultima_glicemia").value = "";
                document.getElementById("ultima_dor").value = "";
                document.getElementById("ultima_o2").value = "";
                document.getElementById("ultima_bpm").value = "";
                document.getElementById("ultima_obs").value = "";
            }
        } catch (err) {
            console.error("Erro ao carregar dados do paciente:", err);
        }
    }
});