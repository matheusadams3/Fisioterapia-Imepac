package com.adsimepac.fisioterapia.repository;

import com.adsimepac.fisioterapia.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByPacienteId(Long pacienteId);

    @Query("SELECT c FROM Consulta c WHERE c.dataInicio >= :inicio AND c.dataFim <= :fim")
    List<Consulta> findByPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT c FROM Consulta c WHERE c.dataInicio >= :inicio AND c.dataFim <= :fim ORDER BY c.dataInicio")
    List<Consulta> findConsultasEntre(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    List<Consulta> findByStatus(String status);
}
