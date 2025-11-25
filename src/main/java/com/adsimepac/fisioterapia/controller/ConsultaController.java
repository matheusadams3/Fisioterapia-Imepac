package com.adsimepac.fisioterapia.controller;

import com.adsimepac.fisioterapia.model.Consulta;
import com.adsimepac.fisioterapia.service.ConsultaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    @Autowired
    private ConsultaService consultaService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarTodas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        List<Consulta> consultas;
        
        if (inicio != null && fim != null) {
            consultas = consultaService.buscarPorPeriodo(inicio, fim);
        } else {
            consultas = consultaService.listarTodas();
        }
        
        // Converte para formato JSON esperado pelo frontend
        List<Map<String, Object>> response = consultas.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("paciente_id", c.getPaciente().getId());
            map.put("paciente_nome", c.getPaciente().getNomeCompleto());
            map.put("data_inicio", c.getDataInicio().toString());
            map.put("data_fim", c.getDataFim().toString());
            map.put("tipo_consulta", c.getTipoConsulta());
            map.put("status", c.getStatus());
            map.put("observacoes", c.getObservacoes());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consulta> buscarPorId(@PathVariable Long id) {
        Optional<Consulta> consulta = consultaService.buscarPorId(id);
        return consulta.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> dados) {
        try {
            Long pacienteId = Long.valueOf(dados.get("paciente_id").toString());
            LocalDateTime dataInicio = LocalDateTime.parse(dados.get("data_inicio").toString());
            LocalDateTime dataFim = LocalDateTime.parse(dados.get("data_fim").toString());
            String tipoConsulta = dados.get("tipo_consulta") != null ? dados.get("tipo_consulta").toString() : "Consulta";
            String status = dados.get("status") != null ? dados.get("status").toString() : "sem_aula";
            
            Consulta consulta = consultaService.criar(pacienteId, dataInicio, dataFim, tipoConsulta, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", consulta.getId());
            response.put("paciente_id", consulta.getPaciente().getId());
            response.put("paciente_nome", consulta.getPaciente().getNomeCompleto());
            response.put("data_inicio", consulta.getDataInicio().toString());
            response.put("data_fim", consulta.getDataFim().toString());
            response.put("tipo_consulta", consulta.getTipoConsulta());
            response.put("status", consulta.getStatus());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Erro ao criar consulta: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erro ao criar consulta: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Consulta> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            Optional<Consulta> consultaOpt = consultaService.buscarPorId(id);
            
            if (consultaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Consulta consulta = consultaOpt.get();
            
            if (dados.containsKey("data_inicio")) {
                consulta.setDataInicio(LocalDateTime.parse(dados.get("data_inicio").toString()));
            }
            if (dados.containsKey("data_fim")) {
                consulta.setDataFim(LocalDateTime.parse(dados.get("data_fim").toString()));
            }
            if (dados.containsKey("tipo_consulta")) {
                consulta.setTipoConsulta(dados.get("tipo_consulta").toString());
            }
            if (dados.containsKey("status")) {
                consulta.setStatus(dados.get("status").toString());
            }
            if (dados.containsKey("observacoes")) {
                consulta.setObservacoes(dados.get("observacoes").toString());
            }
            
            Consulta consultaAtualizada = consultaService.atualizar(id, consulta);
            return ResponseEntity.ok(consultaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            consultaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Consulta>> buscarPorPaciente(@PathVariable Long pacienteId) {
        List<Consulta> consultas = consultaService.buscarPorPaciente(pacienteId);
        return ResponseEntity.ok(consultas);
    }
}
