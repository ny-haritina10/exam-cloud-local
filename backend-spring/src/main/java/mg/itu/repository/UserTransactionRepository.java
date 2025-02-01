package mg.itu.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class UserTransactionRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public UserTransactionRepository(JdbcTemplate jdbcTemplate) {
        this.namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    public List<Map<String, Object>> getUserTransactionSummary(String dateMin, String dateMax) {
        String sql = """
            SELECT
                u.id AS user_id,
                u.user_name AS user_name,
                COALESCE(SUM(
                    CASE
                        WHEN ct.is_purchase THEN ct.quantity * closest_cours.cours
                        ELSE 0
                    END
                ), 0) AS total_achat,
                COALESCE(SUM(
                    CASE
                        WHEN ct.is_sale THEN ct.quantity * closest_cours.cours
                        ELSE 0
                    END
                ), 0) AS total_vente,
                COALESCE(SUM(
                    CASE
                        WHEN ct.is_purchase THEN ct.quantity * closest_cours.cours
                        WHEN ct.is_sale THEN -ct.quantity * closest_cours.cours
                        ELSE 0
                    END
                ), 0) AS total_amount,
                COALESCE(SUM(
                    CASE
                        WHEN ct.is_purchase THEN ct.quantity
                        WHEN ct.is_sale THEN -ct.quantity
                        ELSE 0
                    END
                ), 0) AS total_crypto_quantity,
                COALESCE(SUM(
                    CASE
                        WHEN ct.is_purchase THEN ct.quantity * closest_cours.cours
                        WHEN ct.is_sale THEN -ct.quantity * closest_cours.cours
                        ELSE 0
                    END
                ), 0) AS total_crypto_value,
                MIN(ct.date_transaction) AS datetime_min,
                MAX(ct.date_transaction) AS datetime_max
            FROM
                users u
            LEFT JOIN
                crypto_transactions ct ON u.id = ct.id_user
            LEFT JOIN LATERAL (
                SELECT ccl.cours
                FROM crypto_cours ccl
                WHERE ccl.id_crypto = ct.id_crypto AND ccl.date_cours <= ct.date_transaction
                ORDER BY ccl.date_cours DESC
                LIMIT 1
            ) closest_cours ON TRUE
            WHERE ct.date_transaction BETWEEN CAST(:dateMin AS TIMESTAMP) AND CAST(:dateMax AS TIMESTAMP)
            GROUP BY
                u.id, u.user_name
            ORDER BY
                u.id
        """;
        
        MapSqlParameterSource parameters = new MapSqlParameterSource()
            .addValue("dateMin", dateMin)
            .addValue("dateMax", dateMax);
            
        return namedParameterJdbcTemplate.queryForList(sql, parameters);
    }
}