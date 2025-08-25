package br.rafaalmeida1.nutri_thata_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NutriThataApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(NutriThataApiApplication.class, args);
	}

}