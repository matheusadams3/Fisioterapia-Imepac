package com.adsimepac.fisioterapia.service;

import com.adsimepac.fisioterapia.model.Consulta;
import com.adsimepac.fisioterapia.model.Paciente;
import com.adsimepac.fisioterapia.repository.ConsultaRepository;
import com.adsimepac.fisioterapia.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ConsultaService {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    public List<Consulta> listarTodas() {
        return consultaRepository.findAll();
    }

    public Optional<Consulta> buscarPorId(Long id) {
        return consultaRepository.findById(id);
    }

    public Consulta salvar(Consulta consulta) {
        return consultaRepository.save(consulta);
    }

    public Consulta criar(Long pacienteId, LocalDateTime dataInicio, LocalDateTime dataFim, 
                          String tipoConsulta, String status) {
        Optional<Paciente> pacienteOpt = pacienteRepository.findById(pacienteId);
        
        if (pacienteOpt.isEmpty()) {
            throw new RuntimeException("Paciente não encontrado com id: " + pacienteId);
        }

        Consulta consulta = new Consulta();
        consulta.setPaciente(pacienteOpt.get());
        consulta.setDataInicio(dataInicio);
        consulta.setDataFim(dataFim);
        consulta.setTipoConsulta(tipoConsulta);
        consulta.setStatus(status != null ? status : "sem_aula");

        return consultaRepository.save(consulta);
    }

    public Consulta atualizar(Long id, Consulta consultaAtualizada) {
        Optional<Consulta> consultaExistente = consultaRepository.findById(id);
        
        if (consultaExistente.isPresent()) {
            Consulta consulta = consultaExistente.get();
            consulta.setDataInicio(consultaAtualizada.getDataInicio());
            consulta.setDataFim(consultaAtualizada.getDataFim());
            consulta.setTipoConsulta(consultaAtualizada.getTipoConsulta());
            consulta.setStatus(consultaAtualizada.getStatus());
            consulta.setObservacoes(consultaAtualizada.getObservacoes());
            
            return consultaRepository.save(consulta);
        }
        
        throw new RuntimeException("Consulta não encontrada com id: " + id);
    }

    public void deletar(Long id) {
        consultaRepository.deleteById(id);
    }

    public List<Consulta> buscarPorPaciente(Long pacienteId) {
        return consultaRepository.findByPacienteId(pacienteId);
    }

    public List<Consulta> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return consultaRepository.findConsultasEntre(inicio, fim);
    }

    public List<Consulta> buscarPorStatus(String status) {
        return consultaRepository.findByStatus(status);
    }
}
