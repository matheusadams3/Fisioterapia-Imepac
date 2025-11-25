package com.adsimepac.fisioterapia.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "registros_medicao")
public class RegistroMedicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro;

    @Column(name = "pressao_arterial")
    private String pressaoArterial;

    @Column(name = "glicemia")
    private String glicemia;

    @Column(name = "escala_dor")
    private String escalaDor;

    @Column(name = "saturacao_o2")
    private String saturacaoO2;

    @Column(name = "bpm")
    private String bpm;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    // Construtores
    public RegistroMedicao() {
        this.dataRegistro = LocalDateTime.now();
    }

    public RegistroMedicao(Paciente paciente) {
        this.paciente = paciente;
        this.dataRegistro = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public String getPressaoArterial() {
        return pressaoArterial;
    }

    public void setPressaoArterial(String pressaoArterial) {
        this.pressaoArterial = pressaoArterial;
    }

    public String getGlicemia() {
        return glicemia;
    }

    public void setGlicemia(String glicemia) {
        this.glicemia = glicemia;
    }

    public String getEscalaDor() {
        return escalaDor;
    }

    public void setEscalaDor(String escalaDor) {
        this.escalaDor = escalaDor;
    }

    public String getSaturacaoO2() {
        return saturacaoO2;
    }

    public void setSaturacaoO2(String saturacaoO2) {
        this.saturacaoO2 = saturacaoO2;
    }

    public String getBpm() {
        return bpm;
    }

    public void setBpm(String bpm) {
        this.bpm = bpm;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
