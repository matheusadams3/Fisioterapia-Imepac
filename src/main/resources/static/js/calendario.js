var calendar;
var consultaSelecionada = null;
var pacienteSelecionado = null;
var horarioSelecionado = null;

// Mapeamento de status para cores
const STATUS_CORES = {
  sem_aula: "#3788d8",
  presenca: "#28a745",
  falta: "#dc3545",
  falta_justificada: "#fd7e14",
  alta_temporaria: "#90ee90",
};

const STATUS_NOMES = {
  sem_aula: "Sem Aula",
  presenca: "Presença",
  falta: "Falta",
  falta_justificada: "Falta Justificada",
  alta_temporaria: "Alta Temporária",
};

document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "pt-br",
    initialView: "timeGridWeek",

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridYear,dayGridMonth,timeGridWeek,timeGridDay",
    },

    slotMinTime: "07:00:00",
    slotMaxTime: "20:00:00",

    // Permite eventos sobrepostos
    slotEventOverlap: true,
    eventOverlap: true,

    // Events serão carregados dinamicamente
    events: function (info, successCallback, failureCallback) {
      carregarConsultas(info.start, info.end)
        .then((eventos) => successCallback(eventos))
        .catch((error) => {
          console.error("Erro ao carregar consultas:", error);
          failureCallback(error);
        });
    },

    dateClick: function (info) {
      if (calendar.view.type === "dayGridMonth") {
        calendar.gotoDate(info.date);
        calendar.changeView("timeGridDay");
      }
    },

    eventClick: function (info) {
      consultaSelecionada = info.event;

      var nome = info.event.title;
      var data =
        info.event.start.toLocaleDateString("pt-BR") +
        " às " +
        info.event.start.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

      var tipoConsulta =
        info.event.extendedProps.tipoConsulta || "Não informado";
      var status = info.event.extendedProps.status || "sem_aula";
      var statusNome = STATUS_NOMES[status] || status;

      document.getElementById("modalPacienteNome").innerHTML =
        "<strong>Nome:</strong> " + nome;
      document.getElementById("modalPacienteData").innerHTML =
        "<strong>Agendado para:</strong> " + data;
      document.getElementById("modalPacienteConsulta").innerHTML =
        "<strong>Tipo de Consulta:</strong> " + tipoConsulta;
      document.getElementById("modalPacienteStatus").innerHTML =
        "<strong>Status:</strong> " + statusNome;

      var pacienteModal = new bootstrap.Modal(
        document.getElementById("pacienteModal")
      );
      pacienteModal.show();
    },
  });

  // Select de meses controlando o calendário
  document.getElementById("mes").addEventListener("change", function () {
    const mesesMap = {
      jan: 0,
      fev: 1,
      mar: 2,
      abr: 3,
      mai: 4,
      jun: 5,
      jul: 6,
      ago: 7,
      set: 8,
      out: 9,
      nov: 10,
      dez: 11,
    };

    let anoAtual = calendar.getDate().getFullYear();
    let mesSelecionado = mesesMap[this.value];

    calendar.gotoDate(new Date(anoAtual, mesSelecionado, 1));
  });

  // Botão Editar - abre modal de edição
  document
    .getElementById("btnEditarConsulta")
    .addEventListener("click", function () {
      if (consultaSelecionada) {
        abrirModalEdicao(consultaSelecionada);
        bootstrap.Modal.getInstance(
          document.getElementById("pacienteModal")
        ).hide();
      }
    });

  // Botão Excluir
  document
    .getElementById("btnExcluirConsulta")
    .addEventListener("click", function () {
      if (consultaSelecionada) {
        if (confirm("Deseja realmente excluir esta consulta?")) {
          excluirConsulta(consultaSelecionada.extendedProps.consultaId);
          bootstrap.Modal.getInstance(
            document.getElementById("pacienteModal")
          ).hide();
        }
      }
    });

  // ===== MODAL SELECIONAR PACIENTE E HORÁRIO =====

  // Quando o modal abrir, carregar pacientes
  document
    .getElementById("modalSelecionarPaciente")
    .addEventListener("shown.bs.modal", function () {
      carregarPacientes();
      // Define data de hoje como padrão
      document.getElementById("dataHorario").valueAsDate = new Date();
    });

  // Buscar paciente
  document
    .getElementById("buscarPaciente")
    .addEventListener("input", function (e) {
      carregarPacientes(e.target.value);
    });

  // Quando selecionar uma data, carregar horários
  document
    .getElementById("dataHorario")
    .addEventListener("change", function () {
      if (this.value) {
        carregarHorarios(this.value);
      }
    });

  // Confirmar agendamento - atualizado para incluir tipo de consulta
  document
    .getElementById("btnConfirmarAgendamento")
    .addEventListener("click", function () {
      criarAgendamento();
    });

  // Atualizar resumo quando tipo de consulta mudar
  document
    .getElementById("tipoConsulta")
    .addEventListener("input", function () {
      const tipo = this.value.trim();
      const resumoTipo = document.getElementById("resumoTipo");
      if (tipo) {
        resumoTipo.textContent = tipo;
        resumoTipo.classList.remove("text-muted");
      } else {
        resumoTipo.textContent = "Não informado";
        resumoTipo.classList.add("text-muted");
      }
    });

  // Salvar edição de consulta
  document
    .getElementById("btnSalvarEdicao")
    .addEventListener("click", function () {
      salvarEdicaoConsulta();
    });

  calendar.render();
  console.log("✅ Calendário carregado com sucesso!");
});

// ===== FUNÇÕES DO MODAL SELECIONAR PACIENTE =====

// Carregar lista de pacientes
async function carregarPacientes(busca = "") {
  try {
    const url = busca
      ? `/api/pacientes?busca=${encodeURIComponent(busca)}`
      : "/api/pacientes";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Erro ao carregar pacientes");
    }

    const pacientes = await response.json();
    renderizarPacientes(pacientes);
  } catch (error) {
    console.error("Erro ao carregar pacientes:", error);

    // Dados de exemplo para desenvolvimento
    const pacientesExemplo = [
      { id: 1, nome: "João Silva", telefone: "(34) 99999-0001", idade: 45 },
      { id: 2, nome: "Maria Santos", telefone: "(34) 99999-0002", idade: 32 },
      { id: 3, nome: "Pedro Oliveira", telefone: "(34) 99999-0003", idade: 28 },
      { id: 4, nome: "Ana Costa", telefone: "(34) 99999-0004", idade: 51 },
      { id: 5, nome: "Carlos Souza", telefone: "(34) 99999-0005", idade: 38 },
    ];

    renderizarPacientes(pacientesExemplo);
  }
}

// Renderizar lista de pacientes
function renderizarPacientes(pacientes) {
  const lista = document.getElementById("listaPacientes");

  if (pacientes.length === 0) {
    lista.innerHTML =
      '<div class="p-3 text-center text-muted">Nenhum paciente encontrado</div>';
    return;
  }

  lista.innerHTML = pacientes
    .map(
      (paciente) => `
          <div 
            class="paciente-item p-3 border-bottom" 
            style="cursor: pointer; transition: background-color 0.2s;"
            data-paciente-id="${paciente.id}"
            data-paciente-nome="${paciente.nomeCompleto}"
            onmouseover="this.style.backgroundColor='#f8f9fa'"
            onmouseout="if(!this.classList.contains('selected')) this.style.backgroundColor='white'"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${paciente.nomeCompleto}</strong>
                <div class="text-muted small">
                  ${paciente.telefone || "Sem telefone"} ${
        paciente.idade ? "• " + paciente.idade + " anos" : ""
      }
                </div>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
            </div>
          </div>
        `
    )
    .join("");

  // Adicionar evento de clique para cada paciente
  lista.querySelectorAll(".paciente-item").forEach((item) => {
    item.addEventListener("click", function () {
      selecionarPaciente(
        this.dataset.pacienteId,
        this.dataset.pacienteNome,
        this
      );
    });
  });
}

// Selecionar paciente
function selecionarPaciente(id, nome, elemento) {
  pacienteSelecionado = { id, nome };

  // Remove seleção anterior
  document.querySelectorAll(".paciente-item").forEach((item) => {
    item.classList.remove("selected");
    item.style.backgroundColor = "white";
  });

  // Adiciona seleção no item clicado
  elemento.classList.add("selected");
  elemento.style.backgroundColor = "#e7f3ff";

  // Atualiza resumo
  document.getElementById("resumoPaciente").textContent = nome;
  document.getElementById("resumoPaciente").classList.remove("text-muted");

  verificarSelecao();
}

// Carregar horários disponíveis
async function carregarHorarios(data) {
  try {
    const response = await fetch(`/api/horarios-disponiveis?data=${data}`);

    if (!response.ok) {
      throw new Error("Erro ao carregar horários");
    }

    const horarios = await response.json();
    renderizarHorarios(horarios);
  } catch (error) {
    console.error("Erro ao carregar horários:", error);

    // Horários de exemplo para desenvolvimento (apenas disponíveis)
    const horariosExemplo = [
      { inicio: "08:00", fim: "09:00" },
      { inicio: "10:00", fim: "11:00" },
      { inicio: "11:00", fim: "12:00" },
      { inicio: "14:00", fim: "15:00" },
      { inicio: "15:00", fim: "16:00" },
      { inicio: "17:00", fim: "18:00" },
      { inicio: "18:00", fim: "19:00" },
    ];

    renderizarHorarios(horariosExemplo);
  }
}

// Renderizar horários
function renderizarHorarios(horarios) {
  const lista = document.getElementById("listaHorarios");

  if (horarios.length === 0) {
    lista.innerHTML =
      '<div class="p-3 text-center text-muted">Nenhum horário disponível</div>';
    return;
  }

  lista.innerHTML = horarios
    .map((horario) => {
      return `
            <div 
              class="horario-item p-3 border-bottom"
              style="cursor: pointer; transition: background-color 0.2s;"
              data-horario-inicio="${horario.inicio}"
              data-horario-fim="${horario.fim}"
              onmouseover="this.style.backgroundColor='#f8f9fa'"
              onmouseout="if(!this.classList.contains('selected')) this.style.backgroundColor='white'"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>${horario.inicio} - ${horario.fim}</strong>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
              </div>
            </div>
          `;
    })
    .join("");

  // Adicionar evento de clique para todos os horários
  lista.querySelectorAll(".horario-item").forEach((item) => {
    item.addEventListener("click", function () {
      selecionarHorario(
        this.dataset.horarioInicio,
        this.dataset.horarioFim,
        this
      );
    });
  });
}

// Selecionar horário
function selecionarHorario(inicio, fim, elemento) {
  horarioSelecionado = { inicio, fim };

  // Remove seleção anterior
  document.querySelectorAll(".horario-item").forEach((item) => {
    item.classList.remove("selected");
    item.style.backgroundColor = "white";
  });

  // Adiciona seleção no item clicado
  elemento.classList.add("selected");
  elemento.style.backgroundColor = "#e7f3ff";

  // Atualiza resumo
  const data = document.getElementById("dataHorario").value;
  const dataFormatada = new Date(data + "T00:00:00").toLocaleDateString(
    "pt-BR"
  );
  document.getElementById(
    "resumoHorario"
  ).textContent = `${dataFormatada} às ${inicio}`;
  document.getElementById("resumoHorario").classList.remove("text-muted");

  verificarSelecao();
}

// Verificar se paciente e horário foram selecionados
function verificarSelecao() {
  const btnConfirmar = document.getElementById("btnConfirmarAgendamento");
  btnConfirmar.disabled = !(pacienteSelecionado && horarioSelecionado);
}

// Criar agendamento - atualizado para incluir tipo de consulta
async function criarAgendamento() {
  if (!pacienteSelecionado || !horarioSelecionado) {
    alert("Selecione um paciente e um horário");
    return;
  }

  const data = document.getElementById("dataHorario").value;
  const dataInicio = `${data}T${horarioSelecionado.inicio}:00`;
  const dataFim = `${data}T${horarioSelecionado.fim}:00`;
  const tipoConsulta =
    document.getElementById("tipoConsulta").value.trim() || "Consulta";

  const consulta = {
    paciente_id: pacienteSelecionado.id,
    data_inicio: dataInicio,
    data_fim: dataFim,
    tipo_consulta: tipoConsulta,
    status: "sem_aula",
  };

  try {
    const response = await fetch("/api/consultas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(consulta),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar consulta");
    }

    const resultado = await response.json();

    // Adiciona evento no calendário
    calendar.addEvent({
      id: resultado.id,
      title: pacienteSelecionado.nome,
      start: dataInicio,
      end: dataFim,
      color: STATUS_CORES.sem_aula,
      extendedProps: {
        consultaId: resultado.id,
        pacienteId: pacienteSelecionado.id,
        tipoConsulta: tipoConsulta,
        status: "sem_aula",
      },
    });

    // Fecha o modal
    bootstrap.Modal.getInstance(
      document.getElementById("modalSelecionarPaciente")
    ).hide();

    // Limpa seleções
    pacienteSelecionado = null;
    horarioSelecionado = null;
    document.getElementById("tipoConsulta").value = "";

    alert("Agendamento criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);

    // Para desenvolvimento, adiciona direto no calendário
    calendar.addEvent({
      title: pacienteSelecionado.nome,
      start: dataInicio,
      end: dataFim,
      color: STATUS_CORES.sem_aula,
      extendedProps: {
        pacienteId: pacienteSelecionado.id,
        tipoConsulta: tipoConsulta,
        status: "sem_aula",
      },
    });

    bootstrap.Modal.getInstance(
      document.getElementById("modalSelecionarPaciente")
    ).hide();
    pacienteSelecionado = null;
    horarioSelecionado = null;
    document.getElementById("tipoConsulta").value = "";

    alert("Agendamento criado (modo desenvolvimento)!");
  }
}

// ===== FUNÇÕES DE EDIÇÃO =====

// Abrir modal de edição com dados da consulta
function abrirModalEdicao(evento) {
  const start = evento.start;
  const end = evento.end;

  // Preenche os campos do formulário
  document.getElementById("editConsultaId").value =
    evento.extendedProps.consultaId || "";
  document.getElementById("editPacienteNome").value = evento.title;
  document.getElementById("editData").value = start.toISOString().split("T")[0];
  document.getElementById("editHorarioInicio").value = start
    .toTimeString()
    .slice(0, 5);
  document.getElementById("editHorarioFim").value = end
    .toTimeString()
    .slice(0, 5);
  document.getElementById("editTipoConsulta").value =
    evento.extendedProps.tipoConsulta || "";
  document.getElementById("editStatus").value =
    evento.extendedProps.status || "sem_aula";

  // Abre o modal de edição
  const modalEdicao = new bootstrap.Modal(
    document.getElementById("modalEditarConsulta")
  );
  modalEdicao.show();
}

// Salvar edição da consulta
async function salvarEdicaoConsulta() {
  const consultaId = document.getElementById("editConsultaId").value;
  const data = document.getElementById("editData").value;
  const horarioInicio = document.getElementById("editHorarioInicio").value;
  const horarioFim = document.getElementById("editHorarioFim").value;
  const tipoConsulta =
    document.getElementById("editTipoConsulta").value.trim() || "Consulta";
  const status = document.getElementById("editStatus").value;

  const dataInicio = `${data}T${horarioInicio}:00`;
  const dataFim = `${data}T${horarioFim}:00`;

  const dadosAtualizados = {
    data_inicio: dataInicio,
    data_fim: dataFim,
    tipo_consulta: tipoConsulta,
    status: status,
  };

  try {
    const response = await fetch(`/api/consultas/${consultaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosAtualizados),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar consulta");
    }

    // Atualiza o evento no calendário
    const evento = calendar.getEventById(consultaId);
    if (evento) {
      evento.setStart(dataInicio);
      evento.setEnd(dataFim);
      evento.setProp("color", STATUS_CORES[status]);
      evento.setExtendedProp("tipoConsulta", tipoConsulta);
      evento.setExtendedProp("status", status);
    } else {
      // Se não encontrou por ID, atualiza o evento selecionado
      consultaSelecionada.setStart(dataInicio);
      consultaSelecionada.setEnd(dataFim);
      consultaSelecionada.setProp("color", STATUS_CORES[status]);
      consultaSelecionada.setExtendedProp("tipoConsulta", tipoConsulta);
      consultaSelecionada.setExtendedProp("status", status);
    }

    // Fecha o modal
    bootstrap.Modal.getInstance(
      document.getElementById("modalEditarConsulta")
    ).hide();

    alert("Consulta atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);

    // Para desenvolvimento, atualiza direto no calendário
    consultaSelecionada.setStart(dataInicio);
    consultaSelecionada.setEnd(dataFim);
    consultaSelecionada.setProp("color", STATUS_CORES[status]);
    consultaSelecionada.setExtendedProp("tipoConsulta", tipoConsulta);
    consultaSelecionada.setExtendedProp("status", status);

    bootstrap.Modal.getInstance(
      document.getElementById("modalEditarConsulta")
    ).hide();

    alert("Consulta atualizada (modo desenvolvimento)!");
  }
}

// ===== FUNÇÕES ORIGINAIS =====
async function carregarConsultas(dataInicio, dataFim) {
  try {
    // SUBSTITUA '/api/consultas' pela URL real do seu backend
    const response = await fetch(
      `/api/consultas?inicio=${dataInicio.toISOString()}&fim=${dataFim.toISOString()}`
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar consultas");
    }

    const consultas = await response.json();

    // Transforma os dados do backend para o formato do FullCalendar
    return consultas.map((consulta) => ({
      id: consulta.id,
      title: consulta.paciente_nome || "Sem nome",
      start: consulta.data_inicio,
      end: consulta.data_fim,
      color: STATUS_CORES[consulta.status] || STATUS_CORES.sem_aula,
      extendedProps: {
        consultaId: consulta.id,
        pacienteId: consulta.paciente_id,
        tipoConsulta: consulta.tipo_consulta,
        status: consulta.status,
        observacoes: consulta.observacoes,
      },
    }));
  } catch (error) {
    console.error("Erro ao carregar consultas:", error);

    // Dados de exemplo para desenvolvimento (remova quando o backend estiver pronto)
    return [
      {
        title: "Registro do Aluno Lian M. Brandão",
        start: "2025-11-25T09:00:00",
        end: "2025-11-25T10:20:00",
        color: STATUS_CORES.sem_aula,
        extendedProps: {
          consultaId: 1,
          pacienteId: 1,
          tipoConsulta: "Avaliação Inicial",
          status: "sem_aula",
        },
      },
      {
        title: "Consulta Maria Silva",
        start: "2025-11-26T14:00:00",
        end: "2025-11-26T15:00:00",
        color: STATUS_CORES.presenca,
        extendedProps: {
          consultaId: 2,
          pacienteId: 2,
          tipoConsulta: "Retorno",
          status: "presenca",
        },
      },
    ];
  }
}

// Função para excluir consulta
async function excluirConsulta(consultaId) {
  try {
    // SUBSTITUA '/api/consultas' pela URL real do seu backend
    const response = await fetch(`/api/consultas/${consultaId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir consulta");
    }

    // Remove o evento do calendário
    consultaSelecionada.remove();
    alert("Consulta excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir consulta:", error);
    alert("Erro ao excluir consulta. Tente novamente.");
  }
}

// Botão Medições do Paciente
$("#btnMedicoesPaciente").on("click", function () {
  $("#pacienteModal").modal("hide");
  $("#modalMedicoesPaciente").modal("show");
  // Carregar os dados do paciente aqui
});

$('#btnMedicoesPaciente').on('click', function() {
  // Pegar o nome do paciente do modal de detalhes
  const nomePaciente = $('#modalPacienteNome').text().replace('Nome:', '').trim();
  
  // Definir no modal de medições
  $('#nomePacienteMedicoes').text(nomePaciente);
  
  // Fechar modal de detalhes e abrir o de medições
  $('#pacienteModal').modal('hide');
  $('#modalMedicoesPaciente').modal('show');
});

// Função para salvar as medições
$('#btnSalvarMedicoes').on('click', function() {
  const idPaciente = $('#idPacienteMedicoes').val();
  const idConsulta = $('#idConsultaMedicoes').val();
  
  // Coletar os dados dos campos
  const medicoes = {
    pacienteId: idPaciente,
    consultaId: idConsulta,
    pressaoArterial: $('#medicoes_atual_pa').val(),
    glicemia: $('#medicoes_atual_glicemia').val(),
    escalaDor: $('#medicoes_atual_dor').val(),
    saturacaoO2: $('#medicoes_atual_o2').val(),
    frequenciaCardiaca: $('#medicoes_atual_bpm').val(),
    observacao: $('#medicoes_atual_obs').val(),
    dataRegistro: new Date().toISOString()
  };
  
  // Validação básica
  if (!idPaciente) {
    alert('Erro: ID do paciente não encontrado.');
    return;
  }
  
  // Aqui você faria a chamada para o backend
  // Exemplo com fetch:
  /*
  fetch('/api/medicoes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicoes)
  })
  .then(response => response.json())
  .then(data => {
    alert('Medições salvas com sucesso!');
    $('#modalMedicoesPaciente').modal('hide');
    // Limpar os campos
    limparCamposMedicoes();
  })
  .catch(error => {
    console.error('Erro ao salvar medições:', error);
    alert('Erro ao salvar medições. Tente novamente.');
  });
  */
  
  // Por enquanto, apenas simulação
  console.log('Medições a serem salvas:', medicoes);
  alert('Medições salvas com sucesso!');
  $('#modalMedicoesPaciente').modal('hide');
  limparCamposMedicoes();
});

// Função para limpar os campos após salvar
function limparCamposMedicoes() {
  $('#medicoes_atual_pa').val('');
  $('#medicoes_atual_glicemia').val('');
  $('#medicoes_atual_dor').val('');
  $('#medicoes_atual_o2').val('');
  $('#medicoes_atual_bpm').val('');
  $('#medicoes_atual_obs').val('');
  $('#idPacienteMedicoes').val('');
  $('#idConsultaMedicoes').val('');
  $('#nomePacienteMedicoes').text('-');
}

// Atualizar a função do botão Medições no modal de detalhes
$(document).on('click', '#btnMedicoesPaciente', function() {
  // Pegar dados do paciente
  const nomePaciente = $('#modalPacienteNome').text().replace('Nome:', '').trim();
  const idConsulta = $('#btnExcluirConsulta').data('consulta-id') || '';
  
  // Aqui você pode pegar o ID do paciente do elemento ou de uma variável global
  // Por exemplo, se você armazenou em um data attribute:
  const idPaciente = $(this).data('paciente-id') || '';
  
  // Definir no modal de medições
  $('#nomePacienteMedicoes').text(nomePaciente);
  $('#idPacienteMedicoes').val(idPaciente);
  $('#idConsultaMedicoes').val(idConsulta);
  
  // Fechar modal de detalhes e abrir o de medições
  $('#pacienteModal').modal('hide');
  $('#modalMedicoesPaciente').modal('show');
});

// Limpar campos quando o modal for fechado
$('#modalMedicoesPaciente').on('hidden.bs.modal', function() {
  limparCamposMedicoes();
});