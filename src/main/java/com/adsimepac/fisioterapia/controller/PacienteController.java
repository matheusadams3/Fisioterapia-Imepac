package com.adsimepac.fisioterapia.controller;

import com.adsimepac.fisioterapia.model.Paciente;
import com.adsimepac.fisioterapia.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @GetMapping
    public ResponseEntity<List<Paciente>> listarTodos(@RequestParam(required = false) String busca) {
        List<Paciente> pacientes;
        
        if (busca != null && !busca.trim().isEmpty()) {
            pacientes = pacienteService.buscarPorTermo(busca);
        } else {
            pacientes = pacienteService.listarTodos();
        }
        
        return ResponseEntity.ok(pacientes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(@PathVariable Long id) {
        Optional<Paciente> paciente = pacienteService.buscarPorId(id);
        return paciente.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Paciente> criar(@RequestBody Paciente paciente) {
        try {
            Paciente novoPaciente = pacienteService.salvar(paciente);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoPaciente);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> atualizar(@PathVariable Long id, @RequestBody Paciente paciente) {
        try {
            Paciente pacienteAtualizado = pacienteService.atualizar(id, paciente);
            return ResponseEntity.ok(pacienteAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            pacienteService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Paciente>> buscar(@RequestParam String termo) {
        List<Paciente> pacientes = pacienteService.buscarPorTermo(termo);
        return ResponseEntity.ok(pacientes);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Paciente>> filtrar(
            @RequestParam(required = false) String genero,
            @RequestParam(required = false) String faixaEtaria,
            @RequestParam(required = false) String possuiDiabetes,
            @RequestParam(required = false) String hipertenso) {
        
        List<Paciente> pacientes = pacienteService.listarTodos();
        
        if (genero != null && !genero.isEmpty()) {
            pacientes = pacienteService.filtrarPorGenero(genero);
        }
        
        if (faixaEtaria != null && !faixaEtaria.isEmpty()) {
            pacientes = pacienteService.filtrarPorFaixaEtaria(faixaEtaria);
        }
        
        if (possuiDiabetes != null && !possuiDiabetes.isEmpty()) {
            // Converte a string "true" ou "false" para Boolean
            Boolean diabetes = Boolean.valueOf(possuiDiabetes);
            pacientes = pacienteService.filtrarPorDiabetes(diabetes);
        }

        if (hipertenso != null && !hipertenso.isEmpty()) {
            // Converte a string "true" ou "false" para Boolean
            Boolean hpts = Boolean.valueOf(hipertenso);
            pacientes = pacienteService.filtrarPorHipertenso(hpts);
        }
        
        return ResponseEntity.ok(pacientes);
    }
}
