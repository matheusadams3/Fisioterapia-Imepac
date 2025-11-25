package com.adsimepac.fisioterapia.service;

import com.adsimepac.fisioterapia.model.Paciente;
import com.adsimepac.fisioterapia.model.RegistroMedicao;
import com.adsimepac.fisioterapia.repository.PacienteRepository;
import com.adsimepac.fisioterapia.repository.RegistroMedicaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RegistroMedicaoService {

    @Autowired
    private RegistroMedicaoRepository registroMedicaoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    public List<RegistroMedicao> listarTodos() {
        return registroMedicaoRepository.findAll();
    }

    public Optional<RegistroMedicao> buscarPorId(Long id) {
        return registroMedicaoRepository.findById(id);
    }

    public RegistroMedicao salvar(RegistroMedicao registro) {
        return registroMedicaoRepository.save(registro);
    }

    public RegistroMedicao criar(Long pacienteId, RegistroMedicao registro) {
        Optional<Paciente> pacienteOpt = pacienteRepository.findById(pacienteId);
        
        if (pacienteOpt.isEmpty()) {
            throw new RuntimeException("Paciente não encontrado com id: " + pacienteId);
        }

        registro.setPaciente(pacienteOpt.get());
        return registroMedicaoRepository.save(registro);
    }

    public void deletar(Long id) {
        registroMedicaoRepository.deleteById(id);
    }

    public List<RegistroMedicao> buscarPorPaciente(Long pacienteId) {
        return registroMedicaoRepository.findByPacienteIdOrderByDataRegistroDesc(pacienteId);
    }

    public Optional<RegistroMedicao> buscarUltimaMedicao(Long pacienteId) {
        // Utiliza o método idiomático do Spring Data JPA para buscar o Top 1
        return registroMedicaoRepository.findTopByPacienteIdOrderByDataRegistroDesc(pacienteId);
    }
}
