// ConsultaDTO.java
package com.adsimepac.fisioterapia.dto;

import java.time.LocalDateTime;

public class ConsultaDTO {
    private Long id;
    private Long pacienteId;
    private String pacienteNome;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private String tipoConsulta;
    private String status;
    private String observacoes;

    // Construtor
    public ConsultaDTO(Long id, Long pacienteId, String pacienteNome,
                       LocalDateTime dataInicio, LocalDateTime dataFim,
                       String tipoConsulta, String status, String observacoes) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.pacienteNome = pacienteNome;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.tipoConsulta = tipoConsulta;
        this.status = status;
        this.observacoes = observacoes;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }

    public String getPacienteNome() { return pacienteNome; }
    public void setPacienteNome(String pacienteNome) { this.pacienteNome = pacienteNome; }

    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }

    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }

    public String getTipoConsulta() { return tipoConsulta; }
    public void setTipoConsulta(String tipoConsulta) { this.tipoConsulta = tipoConsulta; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}