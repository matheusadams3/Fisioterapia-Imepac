package com.adsimepac.fisioterapia.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "genero")
    private String genero;

    @Column(name = "telefone_principal", nullable = true)
    private String telefone;

    @Column(name = "telefone_secundario", nullable = true)
    private String telefoneSecundario;

    @Column(name = "endereco")
    private String endereco;

    @Column(name = "sobre_paciente", columnDefinition = "TEXT")
    private String sobrePaciente;

    @Column(name = "observacoes_gerais", columnDefinition = "TEXT")
    private String observacoesGerais;

    @Column(name = "possui_diabetes")
    private Boolean possuiDiabetes = false;

    @Column(name = "hipertenso")
    private Boolean hipertenso = false;

    @JsonIgnoreProperties("paciente")
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Consulta> consultas = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegistroMedicao> registros = new ArrayList<>();

    // Construtores
    public Paciente() {
    }

    public Paciente(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getTelefoneSecundario() {
        return telefoneSecundario;
    }

    public void setTelefoneSecundario(String telefoneSecundario) {
        this.telefoneSecundario = telefoneSecundario;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getSobrePaciente() {
        return sobrePaciente;
    }

    public void setSobrePaciente(String sobrePaciente) {
        this.sobrePaciente = sobrePaciente;
    }

    public String getObservacoesGerais() {
        return observacoesGerais;
    }

    public void setObservacoesGerais(String observacoesGerais) {
        this.observacoesGerais = observacoesGerais;
    }

    public Boolean getPossuiDiabetes() {
        return possuiDiabetes;
    }

    public void setPossuiDiabetes(Boolean possuiDiabetes) {
        this.possuiDiabetes = possuiDiabetes;
    }

    public Boolean getHipertenso() {
        return hipertenso;
    }

    public void setHipertenso(Boolean hipertenso) {
        this.hipertenso = hipertenso;
    }

    public List<Consulta> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<Consulta> consultas) {
        this.consultas = consultas;
    }

    public List<RegistroMedicao> getRegistros() {
        return registros;
    }

    public void setRegistros(List<RegistroMedicao> registros) {
        this.registros = registros;
    }
}
