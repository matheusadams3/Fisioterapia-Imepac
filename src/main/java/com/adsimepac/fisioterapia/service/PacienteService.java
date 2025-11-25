package com.adsimepac.fisioterapia.service;

import com.adsimepac.fisioterapia.model.Paciente;
import com.adsimepac.fisioterapia.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;

    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    public Optional<Paciente> buscarPorId(Long id) {
        return pacienteRepository.findById(id);
    }

    public Paciente salvar(Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    public Paciente atualizar(Long id, Paciente pacienteAtualizado) {
        Optional<Paciente> pacienteExistente = pacienteRepository.findById(id);
        
        if (pacienteExistente.isPresent()) {
            Paciente paciente = pacienteExistente.get();
            paciente.setNomeCompleto(pacienteAtualizado.getNomeCompleto());
            paciente.setDataNascimento(pacienteAtualizado.getDataNascimento());
            paciente.setGenero(pacienteAtualizado.getGenero());
            paciente.setTelefone(pacienteAtualizado.getTelefone());
            paciente.setTelefoneSecundario(pacienteAtualizado.getTelefoneSecundario());
            paciente.setEndereco(pacienteAtualizado.getEndereco());
            paciente.setSobrePaciente(pacienteAtualizado.getSobrePaciente());
            paciente.setObservacoesGerais(pacienteAtualizado.getObservacoesGerais());
            paciente.setPossuiDiabetes(pacienteAtualizado.getPossuiDiabetes());
            paciente.setHipertenso(pacienteAtualizado.getHipertenso());
            
            return pacienteRepository.save(paciente);
        }
        
        throw new RuntimeException("Paciente não encontrado com id: " + id);
    }

    public void deletar(Long id) {
        pacienteRepository.deleteById(id);
    }

    public List<Paciente> buscarPorTermo(String termo) {
        return pacienteRepository.buscarPorTermo(termo);
    }

    public List<Paciente> filtrarPorGenero(String genero) {
        return pacienteRepository.findByGenero(genero);
    }

    public List<Paciente> filtrarPorDiabetes(Boolean possuiDiabetes) {
        return pacienteRepository.findByPossuiDiabetes(possuiDiabetes);
    }

    public List<Paciente> filtrarPorHipertenso(Boolean hipertenso) {
        return pacienteRepository.findByHipertenso(hipertenso);
    }

    public Integer calcularIdade(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            return null;
        }
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    public List<Paciente> filtrarPorFaixaEtaria(String faixaEtaria) {
        List<Paciente> todosPacientes = pacienteRepository.findAll();
        
        return todosPacientes.stream()
            .filter(p -> {
                Integer idade = calcularIdade(p.getDataNascimento());
                if (idade == null) return false;
                
                switch (faixaEtaria) {
                    case "Menores de 18":
                        return idade < 18;
                    case "18–30":
                        return idade >= 18 && idade <= 30;
                    case "31–50":
                        return idade >= 31 && idade <= 50;
                    case "Acima de 50":
                        return idade > 50;
                    default:
                        return true;
                }
            })
            .toList();
    }
}
