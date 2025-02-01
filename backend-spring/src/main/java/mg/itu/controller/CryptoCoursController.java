package mg.itu.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import mg.itu.dto.CryptoCoursDTO;
import mg.itu.model.CryptoCours;
import mg.itu.repository.CryptoCoursRepository;
import mg.itu.service.CryptoCoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/crypto/prices")
@CrossOrigin(origins = "*")
@Tag(name = "Crypto Prices", description = "Endpoints for managing cryptocurrency prices and history")
public class CryptoCoursController {

    @Autowired
    private CryptoCoursService cryptoCoursService;

    @Autowired
    private CryptoCoursRepository cryptoCoursRepository;

    @GetMapping
    public ResponseEntity<List<CryptoCoursDTO>> getAllPrices() {
        return ResponseEntity.ok(cryptoCoursService.getAllCurrentPrices());
    }

    @GetMapping("/{cryptoId}")
    public ResponseEntity<CryptoCoursDTO> getCryptoPrice(@PathVariable Long cryptoId) {
        CryptoCoursDTO price = cryptoCoursService.getCryptoPrice(cryptoId);
        if (price == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(price);
    }

    @GetMapping("/{cryptoId}/history")
    public ResponseEntity<List<CryptoCoursDTO>> getCryptoPriceHistory(
            @PathVariable Long cryptoId,
            @RequestParam(defaultValue = "7") Integer days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<CryptoCours> history = cryptoCoursRepository.findPriceHistory(cryptoId, startDate);

        List<CryptoCoursDTO> dtos = history.stream()
            .map(cours -> new CryptoCoursDTO(
                cours.getCrypto().getId(),
                cours.getCrypto().getLabel(),
                cours.getCours(),
                cours.getDateCours()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}