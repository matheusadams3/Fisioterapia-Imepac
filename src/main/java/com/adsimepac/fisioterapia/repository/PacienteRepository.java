package com.adsimepac.fisioterapia.repository;

import com.adsimepac.fisioterapia.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query("SELECT p FROM Paciente p WHERE " +
           "LOWER(p.nomeCompleto) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.telefone) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.endereco) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Paciente> buscarPorTermo(@Param("termo") String termo);

    List<Paciente> findByGenero(String genero);
    List<Paciente> findByPossuiDiabetes(Boolean possuiDiabetes);
    List<Paciente> findByHipertenso(Boolean hipertenso);
}
