package com.adsimepac.fisioterapia.controller;

import com.adsimepac.fisioterapia.model.RegistroMedicao;
import com.adsimepac.fisioterapia.service.RegistroMedicaoService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/registros")
public class RegistroMedicaoController {

    @Autowired
    private RegistroMedicaoService registroMedicaoService;

    @GetMapping
    public ResponseEntity<List<RegistroMedicao>> listarTodos() {
        List<RegistroMedicao> registros = registroMedicaoService.listarTodos();
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroMedicao> buscarPorId(@PathVariable Long id) {
        Optional<RegistroMedicao> registro = registroMedicaoService.buscarPorId(id);
        return registro.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/paciente/{pacienteId}")
    public ResponseEntity<?> criar(@PathVariable Long pacienteId, @RequestBody RegistroMedicao registro) {
        try {
            RegistroMedicao novoRegistro = registroMedicaoService.criar(pacienteId, registro);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoRegistro);
        } catch (RuntimeException e) {
            System.err.println("Erro ao criar registro de medição: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body((RegistroMedicao) null); // Retorna null no corpo para manter o tipo, ou lança exceção para ser tratada globalmente
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            registroMedicaoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<RegistroMedicao>> buscarPorPaciente(@PathVariable Long pacienteId) {
        List<RegistroMedicao> registros = registroMedicaoService.buscarPorPaciente(pacienteId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/paciente/{pacienteId}/ultima")
    public ResponseEntity<RegistroMedicao> buscarUltimaMedicao(@PathVariable Long pacienteId) {
        return registroMedicaoService.buscarUltimaMedicao(pacienteId)
                       .map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
}
