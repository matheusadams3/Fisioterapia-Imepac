package com.adsimepac.fisioterapia.repository;

import com.adsimepac.fisioterapia.model.RegistroMedicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroMedicaoRepository extends JpaRepository<RegistroMedicao, Long> {

    List<RegistroMedicao> findByPacienteIdOrderByDataRegistroDesc(Long pacienteId);

    // Query JPQL para buscar a última medição, garantindo que o mapeamento
    // com a entidade RegistroMedicao seja feito corretamente pelo JPA.
    // O método findTopBy... é a forma mais idiomática de fazer isso com Spring Data JPA.
    Optional<RegistroMedicao> findTopByPacienteIdOrderByDataRegistroDesc(Long pacienteId);
}
